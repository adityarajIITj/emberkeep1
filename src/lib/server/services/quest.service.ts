import { prisma } from "../prisma";
import { CreateQuestInput, UpdateQuestInput } from "@/lib/validation/quest";

export interface QuestFilters {
  status?: string;
  difficulty?: string;
  recurrence?: string;
  discipline?: string;
}

export class QuestService {
  /**
   * Retrieves active quests strictly owned by the caller.
   */
  static async getQuests(userId: string, filters: QuestFilters = {}) {
    const whereClause: Record<string, unknown> = {
      user_id: userId,
      deleted_at: null,
    };

    if (filters.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = "ACTIVE";
    }

    if (filters.difficulty) {
      whereClause.difficulty = filters.difficulty;
    }

    if (filters.recurrence) {
      whereClause.recurrence = filters.recurrence;
    }

    if (filters.discipline) {
      whereClause.category = {
        attribute: {
          key: filters.discipline,
        },
      };
    }

    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        category: {
          include: {
            attribute: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Query user timezone to calculate period keys for completion checking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });

    let todayStr = new Date().toISOString().slice(0, 10);
    try {
      todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: user?.timezone || "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      // fallback to UTC
    }

    // Calculate current week period key e.g. 2026-W37
    const now = new Date();
    const tempDate = new Date(now);
    const dayNum = (tempDate.getUTCDay() + 6) % 7;
    tempDate.setUTCDate(tempDate.getUTCDate() - dayNum + 3);
    const firstThursday = tempDate.getTime();
    tempDate.setUTCMonth(0, 1);
    if (tempDate.getUTCDay() !== 4) {
      tempDate.setUTCMonth(0, 1 + ((4 - tempDate.getUTCDay() + 7) % 7));
    }
    const weekNum = 1 + Math.ceil((firstThursday - tempDate.getTime()) / 604800000);
    const weekPeriodKey = `${todayStr.slice(0, 4)}-W${String(weekNum).padStart(2, "0")}`;

    const questIds = quests.map((q) => q.id);
    const completions = await prisma.questCompletion.findMany({
      where: {
        quest_id: { in: questIds },
        user_id: userId,
      },
      select: {
        quest_id: true,
        period_key: true,
        completed_at: true,
        xp_awarded: true,
        gold_awarded: true,
      },
    });

    return quests.map((quest) => {
      let isCompleted = false;
      let completedData: { xp_awarded: number; gold_awarded: number; completed_at: Date } | null = null;

      if (quest.recurrence === "ONE_TIME") {
        const c = completions.find((comp) => comp.quest_id === quest.id);
        if (c) {
          isCompleted = true;
          completedData = c;
        }
      } else if (quest.recurrence === "DAILY") {
        const c = completions.find((comp) => comp.quest_id === quest.id && comp.period_key === todayStr);
        if (c) {
          isCompleted = true;
          completedData = c;
        }
      } else if (quest.recurrence === "WEEKLY") {
        const c = completions.find((comp) => comp.quest_id === quest.id && comp.period_key === weekPeriodKey);
        if (c) {
          isCompleted = true;
          completedData = c;
        }
      }

      return {
        ...quest,
        is_completed: isCompleted,
        completed_today: isCompleted,
        reward_awarded: completedData
          ? { xp: completedData.xp_awarded, gold: completedData.gold_awarded }
          : null,
      };
    });
  }

  /**
   * Creates a new Quest with ownership verification on category.
   */
  static async createQuest(userId: string, input: CreateQuestInput) {
    // Verify category exists and caller has rights to use it
    const category = await prisma.questCategory.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      const err = new Error("Quest category not found");
      (err as unknown as { code: string; status: number }).code = "CATEGORY_NOT_FOUND";
      (err as unknown as { code: string; status: number }).status = 404;
      throw err;
    }

    // Category must be either a system default (user_id === null) or owned by the user
    if (category.user_id !== null && category.user_id !== userId) {
      const err = new Error("Cannot use another user's custom category");
      (err as unknown as { code: string; status: number }).code = "FORBIDDEN_CATEGORY";
      (err as unknown as { code: string; status: number }).status = 403;
      throw err;
    }

    return await prisma.quest.create({
      data: {
        user_id: userId,
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        difficulty: input.difficulty,
        recurrence: input.recurrence ?? "ONE_TIME",
        status: "ACTIVE",
        due_date: input.dueDate ? new Date(input.dueDate) : null,
      },
      include: {
        category: {
          include: {
            attribute: true,
          },
        },
      },
    });
  }

  /**
   * Retrieves a single quest owned by the caller.
   */
  static async getQuestById(userId: string, questId: string) {
    return await prisma.quest.findFirst({
      where: {
        id: questId,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        category: {
          include: {
            attribute: true,
          },
        },
      },
    });
  }

  /**
   * Updates only allow-listed quest fields.
   */
  static async updateQuest(
    userId: string,
    questId: string,
    input: UpdateQuestInput
  ) {
    // Check ownership
    const existing = await prisma.quest.findFirst({
      where: {
        id: questId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return null;
    }

    // If changing category, verify category ownership
    if (input.categoryId && input.categoryId !== existing.category_id) {
      const category = await prisma.questCategory.findUnique({
        where: { id: input.categoryId },
      });

      if (!category || (category.user_id !== null && category.user_id !== userId)) {
        const err = new Error("Invalid or forbidden category");
        (err as unknown as { code: string; status: number }).code = "INVALID_CATEGORY";
        (err as unknown as { code: string; status: number }).status = 400;
        throw err;
      }
    }

    // Allow-list update payload
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.recurrence !== undefined) updateData.recurrence = input.recurrence;
    if (input.dueDate !== undefined) {
      updateData.due_date = input.dueDate ? new Date(input.dueDate) : null;
    }

    return await prisma.quest.update({
      where: { id: questId },
      data: updateData,
      include: {
        category: {
          include: {
            attribute: true,
          },
        },
      },
    });
  }

  /**
   * Soft deletes a quest so historical completion ledger references remain intact (§6 & §11).
   */
  static async softDeleteQuest(userId: string, questId: string) {
    const existing = await prisma.quest.findFirst({
      where: {
        id: questId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return null;
    }

    return await prisma.quest.update({
      where: { id: questId },
      data: {
        deleted_at: new Date(),
        status: "ARCHIVED",
      },
    });
  }

  /**
   * Fetches available categories (seeded defaults + user's custom categories).
   */
  static async getCategories(userId: string) {
    return await prisma.questCategory.findMany({
      where: {
        OR: [{ user_id: null }, { user_id: userId }],
      },
      include: {
        attribute: true,
      },
      orderBy: {
        label: "asc",
      },
    });
  }
}
