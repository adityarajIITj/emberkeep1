import { prisma } from "../prisma";
import { CharacterInitInput } from "@/lib/validation/character";

export class CharacterService {
  /**
   * Initializes a new Adventurer profile and character inside a single ACID transaction.
   * Creates:
   * 1. User profile row
   * 2. Character state row (Level 1, 0 XP, 0 Gold, 0 Streak)
   * 3. 5 CharacterAttribute rows (one per Discipline, XP 0, Level 1)
   *
   * Idempotent: rejects duplicate initialization with a 409 Conflict.
   */
  static async initCharacter(
    userId: string,
    email: string,
    input: CharacterInitInput
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Idempotent check: if character exists, update details and return smoothly
      const existingCharacter = await tx.character.findUnique({
        where: { user_id: userId },
        include: { user: true },
      });

      if (existingCharacter) {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            display_name: input.displayName,
            timezone: input.timezone,
          },
        });
        const characterAttributes = await tx.characterAttribute.findMany({
          where: { user_id: userId },
          include: { attribute: true },
        });
        return {
          user: updatedUser,
          character: existingCharacter,
          disciplines: characterAttributes,
        };
      }

      // 2. Upsert user record
      const user = await tx.user.upsert({
        where: { id: userId },
        update: {
          display_name: input.displayName,
          timezone: input.timezone,
        },
        create: {
          id: userId,
          email,
          display_name: input.displayName,
          timezone: input.timezone,
        },
      });

      // 3. Create initial character
      const character = await tx.character.create({
        data: {
          user_id: userId,
          level: 1,
          total_xp: 0,
          gold: 0,
          current_streak: 0,
          longest_streak: 0,
        },
      });

      // 4. Fetch all 5 seeded Disciplines
      const attributes = await tx.attribute.findMany();

      // 5. Create per-discipline character attributes
      const characterAttributes = [];
      for (const attr of attributes) {
        const ca = await tx.characterAttribute.create({
          data: {
            user_id: userId,
            attribute_id: attr.id,
            xp: 0,
            level: 1,
          },
          include: {
            attribute: true,
          },
        });
        characterAttributes.push(ca);
      }

      return {
        user,
        character,
        characterAttributes,
      };
    });
  }

  /**
   * Retrieves authoritative character data scoped strictly to the authenticated userId.
   */
  static async getCharacter(userId: string) {
    const character = await prisma.character.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            display_name: true,
            avatar_url: true,
            timezone: true,
          },
        },
      },
    });

    if (!character) {
      return null;
    }

    const disciplines = await prisma.characterAttribute.findMany({
      where: { user_id: userId },
      include: {
        attribute: true,
      },
      orderBy: {
        attribute: {
          key: "asc",
        },
      },
    });

    // Equipped cosmetic items lookup
    const equippedItemIds = [
      character.equipped_theme_id,
      character.equipped_title_id,
      character.equipped_frame_id,
    ].filter(Boolean) as string[];

    const equippedItems =
      equippedItemIds.length > 0
        ? await prisma.inventoryItem.findMany({
            where: {
              id: { in: equippedItemIds },
              user_id: userId,
            },
            include: {
              shop_item: true,
            },
          })
        : [];

    return {
      ...character,
      disciplines,
      equipped: {
        theme: equippedItems.find((i) => i.id === character.equipped_theme_id)?.shop_item || null,
        title: equippedItems.find((i) => i.id === character.equipped_title_id)?.shop_item || null,
        frame: equippedItems.find((i) => i.id === character.equipped_frame_id)?.shop_item || null,
      },
    };
  }
}
