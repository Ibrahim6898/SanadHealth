import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const readingSchema = z.object({
  type: z.enum([
    "BLOOD_SUGAR",
    "BLOOD_PRESSURE_SYSTOLIC",
    "BLOOD_PRESSURE_DIASTOLIC",
    "WEIGHT",
    "BMI",
  ]),
  value: z.number(),
  secondValue: z.number().optional(), // Used if we combine BP
  unit: z.string(),
  note: z.string().optional(),
});

export const createReading = async (req, res, next) => {
  try {
    const data = readingSchema.parse(req.body);

    const reading = await prisma.healthReading.create({
      data: {
        userId: req.user.id,
        ...data,
      },
    });

    res.status(201).json({ reading });
  } catch (error) {
    next(error);
  }
};

export const getReadings = async (req, res, next) => {
  try {
    const { type } = req.query;

    const readings = await prisma.healthReading.findMany({
      where: {
        userId: req.user.id,
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit by default
    });

    res.json(readings);
  } catch (error) {
    next(error);
  }
};

export const getReadingTrends = async (req, res, next) => {
  try {
    // Return aggregated lists partitioned by type for charting
    const readings = await prisma.healthReading.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    const trends = readings.reduce((acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push({
        value: curr.value,
        secondValue: curr.secondValue,
        date: curr.createdAt,
      });
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    next(error);
  }
};
