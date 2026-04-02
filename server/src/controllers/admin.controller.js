import { prisma } from "../lib/prisma.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile: {
          select: {
            state: true,
            lga: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const patients = users.filter(u => u.role === "PATIENT");
    const chews = users.filter(u => u.role === "CHEW");

    // Get current assignments
    const assignments = await prisma.cHEWAssignment.findMany({
      include: {
        chew: { select: { name: true } },
        patient: { select: { name: true } }
      }
    });

    res.json({ patients, chews, assignments });
  } catch (error) {
    next(error);
  }
};

export const assignPatient = async (req, res, next) => {
  try {
    const { patientId, chewId } = req.body;

    if (!patientId || !chewId) {
      return res.status(400).json({ message: "Patient ID and CHEW ID are required" });
    }

    const assignment = await prisma.cHEWAssignment.upsert({
      where: {
        chewId_patientId: {
          chewId,
          patientId,
        },
      },
      update: {},
      create: {
        chewId,
        patientId,
      },
    });

    res.json({ message: "Patient assigned successfully", assignment });
  } catch (error) {
    next(error);
  }
};

export const removeAssignment = async (req, res, next) => {
  try {
    const { patientId, chewId } = req.body;

    await prisma.cHEWAssignment.delete({
      where: {
        chewId_patientId: {
          chewId,
          patientId,
        },
      },
    });

    res.json({ message: "Assignment removed successfully" });
  } catch (error) {
    next(error);
  }
};
