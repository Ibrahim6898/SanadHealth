import { generateRiskAssessment } from "../services/ai.service.js";
import { prisma } from "../lib/prisma.js";

export const createAssessment = async (req, res, next) => {
  try {
    const { responses } = req.body;
    const userId = req.user.id;

    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(400).json({
        message: "Please complete your health profile first before taking an assessment.",
      });
    }

    const aiResult = await generateRiskAssessment(
      profile,
      responses,
      req.user.language
    );

    const assessment = await prisma.assessment.create({
      data: {
        userId,
        responses,
        riskLevel: aiResult.riskLevel,
        riskScore: aiResult.riskScore,
        aiRecommendation: aiResult.explanation,
        recommendations: aiResult.recommendations,
        urgentCare: aiResult.urgentCare,
        language: req.user.language,
      },
    });

    // We can fire a notification here asynchronously if urgentCare is true
    // (Notification service logic to be added later)

    res.status(201).json({ assessment });
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(assessments);
  } catch (error) {
    next(error);
  }
};

export const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });

    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    
    // Ensure standard patient users can only view their own
    if (req.user.role === "PATIENT" && assessment.userId !== req.user.id) {
       return res.status(403).json({ message: "Access denied" });
    }

    res.json(assessment);
  } catch (error) {
    next(error);
  }
};
