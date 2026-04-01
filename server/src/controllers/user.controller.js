import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const profileSchema = z.object({
  age: z.number().int().min(0).max(120),
  gender: z.string(),
  weight: z.number().positive(),
  height: z.number().positive(),
  state: z.string(),
  lga: z.string(),
  familyHistory: z.boolean(),
  smoker: z.boolean(),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"]),
  dietType: z.enum(["HIGH_CARB", "BALANCED", "HIGH_PROTEIN", "VEGETARIAN"]),
});

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    // Only allow updating non-sensitive fields
    const { name, phone, language } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(language && { language }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        language: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const upsertProfile = async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body);

    const profile = await prisma.healthProfile.upsert({
      where: { userId: req.user.id },
      update: data,
      create: {
        ...data,
        userId: req.user.id,
      },
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};
