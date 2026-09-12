import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const userId = session.userId;

    // 1. Fetch Character for lifetime stats
    const character = await prisma.character.findUnique({
      where: { user_id: userId },
    });

    // 2. Fetch Quest Completions (last 50)
    const completions = await prisma.questCompletion.findMany({
      where: { user_id: userId },
      include: {
        quest: {
          select: {
            title: true,
            difficulty: true,
          },
        },
        attribute: {
          select: {
            label: true,
            color_hex: true,
          },
        },
      },
      orderBy: { completed_at: "desc" },
      take: 50,
    });

    // 3. Fetch Gold Ledger entries (last 50)
    const goldLedger = await prisma.goldLedger.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    // 4. Lifetime aggregate totals
    const totalQuestsCompleted = await prisma.questCompletion.count({
      where: { user_id: userId },
    });

    const xpSum = await prisma.xPLedger.aggregate({
      where: { user_id: userId },
      _sum: { amount: true },
    });

    const positiveGoldSum = await prisma.goldLedger.aggregate({
      where: {
        user_id: userId,
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    });

    // 5. Unify into a single chronological timeline
    type TimelineItem = {
      id: string;
      type: "QUEST_COMPLETION" | "SHOP_PURCHASE" | "STREAK_BONUS" | "LEVEL_UP_BONUS";
      title: string;
      subtitle?: string;
      xpChange?: number;
      goldChange?: number;
      disciplineLabel?: string;
      disciplineColor?: string;
      timestamp: string;
    };

    const timeline: TimelineItem[] = [];

    // Map completions
    completions.forEach((c) => {
      timeline.push({
        id: `comp-${c.id}`,
        type: "QUEST_COMPLETION",
        title: c.quest?.title || "Conquered Quest",
        subtitle: `${c.quest?.difficulty || "QUEST"} • ${c.attribute?.label || "General"}`,
        xpChange: c.xp_awarded,
        goldChange: c.gold_awarded,
        disciplineLabel: c.attribute?.label,
        disciplineColor: c.attribute?.color_hex,
        timestamp: c.completed_at.toISOString(),
      });
    });

    // Map shop purchases and bonuses from gold ledger
    for (const g of goldLedger) {
      if (g.source === "SHOP_PURCHASE") {
        let itemName = "Cosmetic Item";
        if (g.reference_id) {
          const item = await prisma.shopItem.findUnique({
            where: { id: g.reference_id },
          });
          if (item) itemName = item.name;
        }

        timeline.push({
          id: `gold-${g.id}`,
          type: "SHOP_PURCHASE",
          title: `Acquired ${itemName}`,
          subtitle: "Bazaar Purchase",
          goldChange: g.amount, // negative
          timestamp: g.created_at.toISOString(),
        });
      } else if (g.source === "STREAK_BONUS") {
        timeline.push({
          id: `gold-${g.id}`,
          type: "STREAK_BONUS",
          title: "Streak Milestone Achieved",
          subtitle: "Dedication Bonus",
          goldChange: g.amount,
          timestamp: g.created_at.toISOString(),
        });
      } else if (g.source === "LEVEL_UP_BONUS") {
        timeline.push({
          id: `gold-${g.id}`,
          type: "LEVEL_UP_BONUS",
          title: "Rank Level-Up Bonus",
          subtitle: "Ascension Reward",
          goldChange: g.amount,
          timestamp: g.created_at.toISOString(),
        });
      }
    }

    // Sort descending by timestamp
    timeline.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return jsonSuccess({
      stats: {
        totalQuestsCompleted,
        totalXpEarned: xpSum._sum.amount || character?.total_xp || 0,
        totalGoldEarned: positiveGoldSum._sum.amount || character?.gold || 0,
        currentStreak: character?.current_streak || 0,
        longestStreak: character?.longest_streak || 0,
      },
      timeline,
    });
  } catch (error) {
    console.error("Chronicle error:", error);
    return jsonError("SERVER_ERROR", "Failed to compile chronicle feed", 500);
  }
}
