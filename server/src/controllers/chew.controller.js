import { prisma } from "../lib/prisma.js";

export const getAssignedPatients = async (req, res, next) => {
  try {
    // Only CHEW users should reach this (handled by authorize middleware)
    const assignments = await prisma.cHEWAssignment.findMany({
      where: { chewId: req.user.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            profile: {
              select: {
                age: true,
                gender: true,
                lga: true,
                state: true,
              },
            },
          },
        },
      },
    });

    const patients = assignments.map((a) => a.patient);
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req, res, next) => {
  try {
    const assignments = await prisma.cHEWAssignment.findMany({
      where: { chewId: req.user.id },
      select: { patientId: true },
    });

    const patientIds = assignments.map((a) => a.patientId);

    // Get patients who have a HIGH or CRITICAL assessment or recent urgentCare
    const alerts = await prisma.assessment.findMany({
      where: {
        userId: { in: patientIds },
        OR: [
          { riskLevel: "HIGH" },
          { riskLevel: "CRITICAL" },
          { urgentCare: true },
        ],
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

export const getPatientProfile = async (req, res, next) => {
  try {
    const { id: patientId } = req.params;

    // Verify assignment
    const assignment = await prisma.cHEWAssignment.findUnique({
      where: {
        chewId_patientId: {
          chewId: req.user.id,
          patientId,
        },
      },
    });

    if (!assignment && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not assigned to this patient" });
    }

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: {
        profile: true,
        assessments: { orderBy: { createdAt: "desc" }, take: 5 },
        readings: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    res.json(patient);
  } catch (error) {
    next(error);
  }
};
