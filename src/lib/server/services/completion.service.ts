import { prisma } from "../prisma";
import {
  computeReward,
  levelFromXp,
  checkStreakMilestones,
  getLevelUpBonus,
  QuestDifficulty,
} from "../rpg-engine";

function getLocalDateString(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // YYYY-MM-DD
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function getLocalYesterdayString(todayStr: string): string {
  const [year, month, day] = todayStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export class CompletionService {
  /**
   * The Critical Endpoint Service (§11 & §15):
   * Complete a quest within a single ACID transaction.
   * Enforces:
   * 1. Authoritative ownership & active status check
   * 2. Idempotency key lookup
   * 3. Period-key unique constraint (guards against duplicate completion)
   * 4. Timezone-aware streak calculation
   * 5. Server-derived reward math via rpg-engine
   * 6. Append-only XP & Gold ledger auditing
   * 7. Level-up & milestone bonus calculations
   * 8. Character and Discipline progression updates
   */
  static async completeQuest(
    userId: string,
    questId: string,
    idempotencyKey: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Quest with relations
      const quest = await tx.quest.findFirst({
        where: {
          id: questId,
          user_id: userId,
          deleted_at: null,
          status: "ACTIVE",
        },
        include: {
          category: {
            include: {
              attribute: true,
            },
          },
        },
      });

      if (!quest) {
        const err = new Error("Quest not found or already archived");
        (err as unknown as { code: string; status: number }).code = "NOT_FOUND";
        (err as unknown as { code: string; status: number }).status = 404;
        throw err;
      }

      // 2. Idempotency Check: if already processed with this key, return existing result
      const existingCompletionWithKey = await tx.questCompletion.findUnique({
        where: { idempotency_key: idempotencyKey },
      });

      if (existingCompletionWithKey) {
        const character = await tx.character.findUnique({
          where: { user_id: userId },
        });
        return {
          isIdempotentRepeat: true,
          completion: existingCompletionWithKey,
          character,
          rewards: {
            xp: existingCompletionWithKey.xp_awarded,
            gold: existingCompletionWithKey.gold_awarded,
            disciplineXp: Math.round(existingCompletionWithKey.xp_awarded * 0.6),
            didLevelUp: false,
            newLevel: character?.level ?? 1,
            milestoneBonusGold: 0,
            levelUpBonusGold: 0,
          },
        };
      }

      // 3. Fetch User (for timezone) & Character
      const user = await tx.user.findUnique({ where: { id: userId } });
      const character = await tx.character.findUnique({ where: { user_id: userId } });

      if (!user || !character) {
        const err = new Error("Adventurer character profile missing. Complete onboarding first.");
        (err as unknown as { code: string; status: number }).code = "PROFILE_MISSING";
        (err as unknown as { code: string; status: number }).status = 400;
        throw err;
      }

      // 4. Compute period_key based on recurrence & user timezone (§6 & §11)
      const now = new Date();
      const userTz = user.timezone || "UTC";
      const todayStr = getLocalDateString(now, userTz);

      let periodKey = "ONE_TIME";
      if (quest.recurrence === "DAILY") {
        periodKey = todayStr;
      } else if (quest.recurrence === "WEEKLY") {
        // Calculate week string e.g. 2026-W37
        const tempDate = new Date(now);
        const dayNum = (tempDate.getUTCDay() + 6) % 7;
        tempDate.setUTCDate(tempDate.getUTCDate() - dayNum + 3);
        const firstThursday = tempDate.getTime();
        tempDate.setUTCMonth(0, 1);
        if (tempDate.getUTCDay() !== 4) {
          tempDate.setUTCMonth(0, 1 + ((4 - tempDate.getUTCDay() + 7) % 7));
        }
        const weekNum = 1 + Math.ceil((firstThursday - tempDate.getTime()) / 604800000);
        periodKey = `${todayStr.slice(0, 4)}-W${String(weekNum).padStart(2, "0")}`;
      }

      // 5. Unique Constraint Guard: prevent completing same quest in same period (§6)
      const existingPeriodCompletion = await tx.questCompletion.findUnique({
        where: {
          quest_id_period_key: {
            quest_id: questId,
            period_key: periodKey,
          },
        },
      });

      if (existingPeriodCompletion) {
        const err = new Error(
          quest.recurrence === "ONE_TIME"
            ? "This quest has already been completed."
            : `Quest already completed for period: ${periodKey}`
        );
        (err as unknown as { code: string; status: number }).code = "ALREADY_COMPLETED";
        (err as unknown as { code: string; status: number }).status = 409;
        throw err;
      }

      // 6. Streak Evaluation
      const todayStreakLog = await tx.streakLog.findUnique({
        where: {
          user_id_activity_date: {
            user_id: userId,
            activity_date: todayStr,
          },
        },
      });

      let newStreak = character.current_streak;
      if (!todayStreakLog) {
        // First activity of today
        const yesterdayStr = getLocalYesterdayString(todayStr);
        const yesterdayLog = await tx.streakLog.findUnique({
          where: {
            user_id_activity_date: {
              user_id: userId,
              activity_date: yesterdayStr,
            },
          },
        });

        if (yesterdayLog) {
          newStreak = character.current_streak + 1;
        } else {
          // If streak was 0 or last active day was older than yesterday, reset to 1
          newStreak = 1;
        }

        // Record activity in StreakLog
        await tx.streakLog.create({
          data: {
            user_id: userId,
            activity_date: todayStr,
          },
        });
      }

      // 7. Calculate authoritative rewards via RPG engine
      const rewardCalc = computeReward(
        quest.difficulty as QuestDifficulty,
        newStreak
      );

      // 8. Streak Milestone Bonus
      const milestoneCheck = checkStreakMilestones(
        newStreak,
        character.longest_streak
      );
      const milestoneBonusGold = milestoneCheck.bonusGold;

      // 9. Level Up Check
      const newTotalXp = character.total_xp + rewardCalc.xp;
      const newLevel = levelFromXp(newTotalXp);
      const didLevelUp = newLevel > character.level;
      const levelUpBonusGold = didLevelUp ? getLevelUpBonus(newLevel) : 0;

      const totalGoldAwarded =
        rewardCalc.gold + milestoneBonusGold + levelUpBonusGold;

      // 10. Record QuestCompletion
      const completion = await tx.questCompletion.create({
        data: {
          quest_id: questId,
          user_id: userId,
          period_key: periodKey,
          xp_awarded: rewardCalc.xp,
          gold_awarded: rewardCalc.gold,
          attribute_id: quest.category.attribute_id,
          idempotency_key: idempotencyKey,
        },
      });

      // 11. Append-only Ledgers
      await tx.xPLedger.create({
        data: {
          user_id: userId,
          amount: rewardCalc.xp,
          source: "QUEST_COMPLETION",
          reference_id: completion.id,
          attribute_id: quest.category.attribute_id,
        },
      });

      await tx.goldLedger.create({
        data: {
          user_id: userId,
          amount: rewardCalc.gold,
          source: "QUEST_COMPLETION",
          reference_id: completion.id,
        },
      });

      if (milestoneBonusGold > 0) {
        await tx.goldLedger.create({
          data: {
            user_id: userId,
            amount: milestoneBonusGold,
            source: "STREAK_BONUS",
            reference_id: completion.id,
          },
        });
      }

      if (levelUpBonusGold > 0) {
        await tx.goldLedger.create({
          data: {
            user_id: userId,
            amount: levelUpBonusGold,
            source: "LEVEL_UP_BONUS",
            reference_id: completion.id,
          },
        });
      }

      // 12. Update Character aggregate
      const updatedCharacter = await tx.character.update({
        where: { user_id: userId },
        data: {
          total_xp: newTotalXp,
          level: newLevel,
          gold: character.gold + totalGoldAwarded,
          current_streak: newStreak,
          longest_streak: Math.max(character.longest_streak, newStreak),
          last_activity_date: now,
        },
      });

      // 13. Update CharacterAttribute for the Discipline
      const currentCa = await tx.characterAttribute.findUnique({
        where: {
          user_id_attribute_id: {
            user_id: userId,
            attribute_id: quest.category.attribute_id,
          },
        },
      });

      let updatedDiscipline = null;
      if (currentCa) {
        const newDisciplineXp = currentCa.xp + rewardCalc.disciplineXp;
        const newDisciplineLevel = levelFromXp(newDisciplineXp);

        updatedDiscipline = await tx.characterAttribute.update({
          where: { id: currentCa.id },
          data: {
            xp: newDisciplineXp,
            level: newDisciplineLevel,
          },
          include: {
            attribute: true,
          },
        });
      }

      // 14. If ONE_TIME quest, archive it
      if (quest.recurrence === "ONE_TIME") {
        await tx.quest.update({
          where: { id: questId },
          data: { status: "ARCHIVED" },
        });
      }

      return {
        isIdempotentRepeat: false,
        completion,
        character: updatedCharacter,
        discipline: updatedDiscipline,
        rewards: {
          xp: rewardCalc.xp,
          gold: rewardCalc.gold,
          disciplineXp: rewardCalc.disciplineXp,
          streakMultiplier: rewardCalc.streakMultiplier,
          didLevelUp,
          previousLevel: character.level,
          newLevel,
          milestoneBonusGold,
          milestoneReached: milestoneCheck.milestoneReached,
          levelUpBonusGold,
          totalGoldAwarded,
        },
      };
    });
  }
}
