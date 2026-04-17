# SanadHealth Code Export

## server/package.json
```json
{
  "name": "sanadhealth-server",
  "version": "1.0.0",
  "description": "SanadHealth API Server",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@google/genai": "^1.48.0",
    "@prisma/client": "^5.14.0",
    "axios": "^1.7.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "prisma": "^5.14.0"
  }
}
```

## server/src/app.js
```js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import chewRoutes from "./routes/chew.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// ─── Security ─────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Parsers ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ─────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chew", chewRoutes);

// ─── 404 ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Error Handler ────────────────────────────
app.use(errorMiddleware);

export default app;
```

## server/server.js
```js
import "dotenv/config";
import app from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 SanadHealth API running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## server/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────

enum Role {
  PATIENT
  CHEW
  ADMIN
}

enum Language {
  ENGLISH
  HAUSA
  PIDGIN
}

enum ActivityLevel {
  SEDENTARY
  LIGHT
  MODERATE
  ACTIVE
}

enum DietType {
  HIGH_CARB
  BALANCED
  HIGH_PROTEIN
  VEGETARIAN
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ReadingType {
  BLOOD_SUGAR
  BLOOD_PRESSURE_SYSTOLIC
  BLOOD_PRESSURE_DIASTOLIC
  WEIGHT
  BMI
}

// ─── USERS ────────────────────────────────────

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role     @default(PATIENT)
  language  Language @default(ENGLISH)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile         HealthProfile?
  assessments     Assessment[]
  readings        HealthReading[]
  notifications   Notification[]
  chewAssignments CHEWAssignment[] @relation("CHEWWorker")
  patientOf       CHEWAssignment[] @relation("CHEWPatient")
}

// ─── HEALTH PROFILE ───────────────────────────

model HealthProfile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  age           Int
  gender        String
  weight        Float
  height        Float
  state         String
  lga           String
  familyHistory Boolean
  smoker        Boolean
  activityLevel ActivityLevel
  dietType      DietType

  updatedAt DateTime @updatedAt
}

// ─── ASSESSMENTS ──────────────────────────────

model Assessment {
  id               String    @id @default(uuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  responses        Json
  riskLevel        RiskLevel
  riskScore        Float
  aiRecommendation String
  recommendations  Json
  urgentCare       Boolean   @default(false)
  language         Language
  createdAt        DateTime  @default(now())

  @@index([userId])
  @@index([createdAt])
}

// ─── HEALTH READINGS ──────────────────────────

model HealthReading {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        ReadingType
  value       Float
  secondValue Float?      // for BP: systolic=value, diastolic=secondValue
  unit        String
  note        String?
  createdAt   DateTime    @default(now())

  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

// ─── NOTIFICATIONS ────────────────────────────

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  message   String
  type      String   // reminder | alert | tip
  sent      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}

// ─── CHEW ASSIGNMENTS ─────────────────────────

model CHEWAssignment {
  id        String   @id @default(uuid())
  chewId    String
  patientId String
  chew      User     @relation("CHEWWorker", fields: [chewId], references: [id])
  patient   User     @relation("CHEWPatient", fields: [patientId], references: [id])
  createdAt DateTime @default(now())

  @@unique([chewId, patientId])
  @@index([chewId])
  @@index([patientId])
}
```

## server/src/routes/ai.routes.js
```js
import { Router } from "express";
import { openChat } from "../controllers/ai.controller.js";
import { createAssessment } from "../controllers/assessment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/chat", openChat);
// As per design, /api/ai/assess is essentially the core assessment endpoint.
// We can just alias or reuse the assessment controller function.
router.post("/assess", createAssessment);

export default router;
```

## server/src/routes/assessment.routes.js
```js
import { Router } from "express";
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
} from "../controllers/assessment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Require auth for all endpoints
router.use(authenticate);

router.post("/", createAssessment);
router.get("/", getAssessments);
router.get("/:id", getAssessmentById);

export default router;
```

## server/src/routes/auth.routes.js
```js
import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);

export default router;
```

## server/src/routes/chew.routes.js
```js
import { Router } from "express";
import {
  getAssignedPatients,
  getAlerts,
  getPatientProfile,
} from "../controllers/chew.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// Only CHEWs (and admins) can access these routes
router.use(authenticate, authorize("CHEW", "ADMIN"));

router.get("/patients", getAssignedPatients);
router.get("/alerts", getAlerts);
router.get("/patients/:id", getPatientProfile);

export default router;
```

## server/src/routes/reading.routes.js
```js
import { Router } from "express";
import {
  createReading,
  getReadings,
  getReadingTrends,
} from "../controllers/reading.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createReading);
router.get("/", getReadings);
router.get("/trends", getReadingTrends);

export default router;
```

## server/src/routes/user.routes.js
```js
import { Router } from "express";
import { getMe, updateMe, upsertProfile } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get("/me", getMe);
router.put("/me", updateMe);
router.post("/profile", upsertProfile);
router.put("/profile", upsertProfile); // Aliasing put and post for upsert

export default router;
```

## server/src/controllers/ai.controller.js
```js
import { GoogleGenAI } from "@google/genai";
import { generateRiskAssessment } from "../services/ai.service.js"; // Reuse

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const openChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    const prompt = `
You are SanadHealth, a preventive health AI assistant for Nigerian users.
Respond in ${req.user.language || "English"}.
Be concise, helpful, and empathetic. Provide general guidance.
Do not provide medical diagnoses. Advise seeing a doctor if appropriate.

User asks:
"${message}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    next(error);
  }
};
```

## server/src/controllers/assessment.controller.js
```js
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
```

## server/src/controllers/auth.controller.js
```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["PATIENT", "CHEW"]).default("PATIENT"),
  language: z.enum(["ENGLISH", "HAUSA", "PIDGIN"]).default("ENGLISH"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        language: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // With JWT stored in localStorage, logout is mostly handled client-side
    // by removing the token. But we provide an endpoint for completeness.
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
```

## server/src/controllers/chew.controller.js
```js
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
```

## server/src/controllers/reading.controller.js
```js
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
```

## server/src/controllers/user.controller.js
```js
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
```

## server/src/middleware/auth.middleware.js
```js
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, language: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};
```

## server/src/middleware/error.middleware.js
```js
export const errorMiddleware = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      message: "A record with this value already exists",
      field: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found" });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
```

## server/src/services/ai.service.js
```js
import { GoogleGenAI } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const calculateBMI = (weight, height) => {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
};

export const generateRiskAssessment = async (profile, responses, language) => {
  const prompt = `
You are SanadHealth, a preventive health AI assistant for Nigerian users.
Respond only in ${language}.

Patient Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- BMI: ${calculateBMI(profile.weight, profile.height)}
- Location: ${profile.lga}, ${profile.state}
- Family history of diabetes/hypertension: ${profile.familyHistory ? "Yes" : "No"}
- Smoker: ${profile.smoker ? "Yes" : "No"}
- Activity level: ${profile.activityLevel}
- Diet type: ${profile.dietType}

Symptom Responses:
${JSON.stringify(responses, null, 2)}

Based on this, provide:
1. Risk level: LOW / MEDIUM / HIGH / CRITICAL
2. Risk score: 0–100 (integer)
3. A clear explanation in simple language (2–3 sentences)
4. 3 specific actionable recommendations for this person (strings in an array)
5. Whether they should see a doctor urgently (boolean)

Format your response exactly as JSON with these keys:
{
  "riskLevel": "",
  "riskScore": 0,
  "explanation": "",
  "recommendations": [],
  "urgentCare": true
}
Do not include any explanation outside of the JSON block. Do not use markdown formatting around the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = response.text;
    
    // Strip possible markdown JSON fences if Claude still includes them
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(clean);
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate AI assessment");
  }
};
```

## server/src/services/notification.service.js
```js
import axios from "axios";
import { prisma } from "../lib/prisma.js";

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "SanadHealth";
const TERMII_URL = "https://api.ng.termii.com/api/sms/send";

/**
 * Sends an SMS using the Termii API and logs it to the Notification table.
 */
export const sendSMS = async (userId, phone, message, type = "tip") => {
  try {
    // If we don't have API keys yet (development), just log and store it
    if (!TERMII_API_KEY) {
      console.log(`[SMS Simulation] To ${phone}: ${message}`);
      
      await prisma.notification.create({ // Ensure lowercase notification model
        data: {
          userId,
          message,
          type,
          sent: true,
        },
      });
      return true;
    }

    // Call Termii
    const response = await axios.post(TERMII_URL, {
      to: phone,
      from: TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    });

    // Save success record
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        sent: true,
      },
    });

    return true;
  } catch (error) {
    console.error("SMS Sending failed:", error?.response?.data || error.message);
    
    // Save failure record
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        sent: false,
      },
    });

    return false;
  }
};
```

## client/package.json
```json
{
  "name": "sanadhealth-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@heroicons/react": "^2.1.3",
    "axios": "^1.7.2",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.2.6",
    "lucide-react": "^0.379.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.2",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.11"
  }
}
```

## client/index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SanadHealth — AI Preventive Care</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## client/postcss.config.js
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## client/src/App.jsx
```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import CHEWPortal from './pages/CHEWPortal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-slate-500">Loading auth state...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Simple temporary navbar */}
        <header className="bg-white shadow relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-primary text-transparent bg-clip-text">SanadHealth</h1>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/assessment" element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } />
            
            <Route path="/chew" element={
              <ProtectedRoute role="CHEW">
                <CHEWPortal />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

## client/src/components/Assessment/QuestionFlow.jsx
```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  {
    id: 'frequentUrination',
    text: 'Do you urinate more frequently than usual, especially at night?',
    type: 'boolean'
  },
  {
    id: 'excessiveThirst',
    text: 'Do you feel unusually thirsty or hungry, even after drinking/eating?',
    type: 'boolean'
  },
  {
    id: 'visionChanges',
    text: 'Have you experienced any recent blurry vision?',
    type: 'boolean'
  },
  {
    id: 'headaches',
    text: 'Do you experience frequent or severe headaches?',
    type: 'boolean'
  },
  {
    id: 'fatigue',
    text: 'Do you feel extremely tired or fatigued without a clear reason?',
    type: 'boolean'
  },
  {
    id: 'chestPain',
    text: 'Have you felt any tightness, pressure, or pain in your chest recently?',
    type: 'boolean'
  }
];

export default function QuestionFlow({ onComplete, loading }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});

  const handleAnswer = (value) => {
    const currentQ = questions[currentIdx];
    const newResponses = { ...responses, [currentQ.id]: value };
    setResponses(newResponses);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 h-full flex flex-col justify-center">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2 font-medium">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center min-h-[300px] flex flex-col justify-center"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
          {questions[currentIdx].text}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button
            disabled={loading}
            onClick={() => handleAnswer(false)}
            className="py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            No
          </button>
          <button
            disabled={loading}
            onClick={() => handleAnswer(true)}
            className="py-4 rounded-xl border-2 border-primary-500 text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            Yes
          </button>
        </div>
      </motion.div>
      
      {loading && (
        <div className="mt-8 text-center text-slate-500 animate-pulse font-medium">
          Consulting AI Assistant...
        </div>
      )}
    </div>
  );
}
```

## client/src/components/Assessment/RiskResult.jsx
```jsx
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function RiskResult({ result }) {
  if (!result) return null;

  const isCritical = result.riskLevel === 'CRITICAL';
  const isHigh = result.riskLevel === 'HIGH';
  const isMedium = result.riskLevel === 'MEDIUM';

  const colorClasses = isCritical 
    ? { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', bar: 'bg-red-500' }
    : isHigh
      ? { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', bar: 'bg-orange-500' }
      : isMedium
        ? { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', bar: 'bg-yellow-500' }
        : { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', bar: 'bg-green-500' };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className={`rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-8 text-center relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-2 ${colorClasses.bar}`} />
        
        <div className="flex justify-center mb-6">
          {(isCritical || isHigh) ? (
            <ExclamationTriangleIcon className={`w-16 h-16 ${colorClasses.text}`} />
          ) : (
            <CheckCircleIcon className={`w-16 h-16 ${colorClasses.text}`} />
          )}
        </div>

        <h1 className={`text-3xl font-bold mb-2 ${colorClasses.text}`}>
          {result.riskLevel} Risk
        </h1>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
          {result.aiRecommendation}
        </p>

        {result.urgentCare && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-center justify-center gap-3 font-medium mb-8">
            <ShieldExclamationIcon className="w-6 h-6" />
            Please see a healthcare professional as soon as possible.
          </div>
        )}

        <div className="bg-white/60 rounded-xl p-6 text-left mb-8 backdrop-blur-sm border border-white/40">
          <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">Actionable Recommendations</h3>
          <ul className="space-y-3">
            {result.recommendations?.map((rec, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <span className={`font-bold ${colorClasses.text}`}>•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <Link 
          to="/dashboard"
          className="inline-block bg-white border border-slate-200 shadow-sm text-slate-700 font-semibold px-8 py-3 rounded-xl hover:bg-slate-50 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

## client/src/components/Auth/Login.jsx
```jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await login(email, password);
      // Route based on role
      if (user.role === 'CHEW') navigate('/chew');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## client/src/components/Auth/Register.jsx
```jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    language: 'ENGLISH',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await register(formData);
      if (user.role === 'CHEW') navigate('/chew');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
            <input
              name="phone"
              type="tel"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Language</label>
            <select
              name="language"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              value={formData.language}
              onChange={handleChange}
            >
              <option value="ENGLISH">English</option>
              <option value="HAUSA">Hausa</option>
              <option value="PIDGIN">Pidgin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength="6"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-white py-2.5 rounded-lg font-medium mt-6 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
```

## client/src/components/CHEW/AlertPanel.jsx
```jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/chew/alerts');
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    // Poll for alerts every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-slate-500 p-4">Loading active alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-green-800 font-bold text-xl mb-1">All Clear</h3>
        <p className="text-green-600">None of your assigned patients currently have high or critical risk alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`rounded-xl p-5 border shadow-sm relative overflow-hidden ${
            alert.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.riskLevel === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} />
          
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              {alert.urgentCare ? (
                <ShieldExclamationIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              ) : (
                <ExclamationTriangleIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              )}
              
              <div>
                <h3 className={`font-bold ${alert.riskLevel === 'CRITICAL' ? 'text-red-900' : 'text-orange-900'} flex items-center gap-2`}>
                  {alert.user.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${alert.riskLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`}>
                    {alert.riskLevel}
                  </span>
                </h3>
                <p className={`text-sm mt-1 ${alert.riskLevel === 'CRITICAL' ? 'text-red-700' : 'text-orange-700'} mb-3`}>
                  {alert.aiRecommendation}
                </p>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-slate-500">
                    Tested: {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </span>
                  <a href={`tel:${alert.user.phone}`} className="text-blue-600 hover:underline">
                    Call: {alert.user.phone || 'Unknown'}
                  </a>
                </div>
              </div>
            </div>
            
            <button className="bg-white border text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## client/src/components/CHEW/PatientList.jsx
```jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/chew/patients');
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="text-slate-500 p-4">Loading assigned patients...</div>;
  if (patients.length === 0) return <div className="text-slate-500 p-4">No patients assigned to you yet.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Your Patients</h2>
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
          {patients.length} Total
        </span>
      </div>
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {patients.map(patient => (
          <div key={patient.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <PhoneIcon className="w-3 h-3" /> {patient.phone || 'No phone'}
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm">
              {patient.profile ? (
                <>
                  <div className="text-slate-700 font-medium">{patient.profile.lga}, {patient.profile.state}</div>
                  <div className="text-slate-500">{patient.profile.age} yrs • {patient.profile.gender}</div>
                </>
              ) : (
                <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium">Profile Incomplete</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## client/src/components/Dashboard/HealthSummary.jsx
```jsx
import { useState } from 'react';
import api from '../../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function HealthSummary({ profile, latestAssessment }) {
  const [showModal, setShowModal] = useState(false);
  const [readingType, setReadingType] = useState('BLOOD_SUGAR');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogReading = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/readings', {
        type: readingType,
        value: Number(value),
        unit: readingType === 'BLOOD_SUGAR' ? 'mg/dL' : 'mmHg'
      });
      setShowModal(false);
      setValue('');
      // In a real app we'd dispatch an update to re-fetch trends
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Failed to log reading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Health Overview</h2>
          <p className="text-sm text-slate-500">Your latest metrics</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Log Reading
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">BMI</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {profile ? (profile.weight / Math.pow(profile.height/100, 2)).toFixed(1) : '--'}
            </span>
          </div>
        </div>

        {/* AI Risk Card */}
        <div className={`p-4 rounded-xl border ${latestAssessment?.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-100' : latestAssessment?.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-100' : 'bg-primary-50 border-primary-100'}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Risk Level</p>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${latestAssessment?.riskLevel === 'CRITICAL' ? 'text-red-700' : latestAssessment?.riskLevel === 'HIGH' ? 'text-orange-700' : 'text-primary-700'}`}>
              {latestAssessment ? latestAssessment.riskLevel : 'Untested'}
            </span>
          </div>
        </div>
      </div>

      {/* Log Modal (Simple implementation) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Log New Reading</h3>
            <form onSubmit={handleLogReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={readingType}
                  onChange={e => setReadingType(e.target.value)}
                >
                  <option value="BLOOD_SUGAR">Blood Sugar (mg/dL)</option>
                  <option value="BLOOD_PRESSURE_SYSTOLIC">Systolic BP</option>
                  <option value="WEIGHT">Weight (kg)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <input 
                  type="number" 
                  step="0.1"
                  required 
                  className="w-full border rounded-lg p-2"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## client/src/components/Dashboard/ReadingChart.jsx
```jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function ReadingChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { data: trendData } = await api.get("/readings/trends");
        // Pull out blood sugar for the primary chart for now
        const bs = trendData.BLOOD_SUGAR || [];
        const formatted = bs.map(item => ({
          ...item,
          dateFormatted: format(new Date(item.date), "MMM dd")
        }));
        setData(formatted);
      } catch (err) {
        console.error("Failed to load trends", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div>;
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">No blood sugar readings logged yet.</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="dateFormatted" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## client/src/context/AuthContext.jsx
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from local storage on mount
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        // We have initial cache, but let's verify with backend
        setUser(JSON.parse(storedUser));
        
        try {
          const { data } = await api.get('/users/me');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          // If the profile fetch fails, the interceptor logs us out if it's a 401
          console.error("Session verification failed", error);
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for global auth expiration fired by api interceptor
    const handleLogout = () => setUser(null);
    window.addEventListener('auth-expired', handleLogout);
    return () => window.removeEventListener('auth-expired', handleLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## client/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 antialiased;
  }
}

/* Glassmorphism utilities */
.glass-panel {
  @apply bg-white/80 backdrop-blur-md border border-white/20 shadow-xl;
}

/* Smooth gradients */
.bg-gradient-primary {
  @apply bg-gradient-to-br from-primary-500 to-primary-700;
}
```

## client/src/main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

## client/src/pages/Assessment.jsx
```jsx
import { useState, useEffect } from 'react';
import QuestionFlow from '../components/Assessment/QuestionFlow';
import RiskResult from '../components/Assessment/RiskResult';
import api from '../services/api';
import { Navigate } from 'react-router-dom';

export default function Assessment() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssessmentComplete = async (responses) => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/ai/assess', { responses });
      setResult(data.assessment);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate assessment. Did you complete your profile first?');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Assessment Error</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.href='/dashboard'}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return <RiskResult result={result} />;
  }

  return <QuestionFlow onComplete={handleAssessmentComplete} loading={loading} />;
}
```

## client/src/pages/CHEWPortal.jsx
```jsx
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/CHEW/PatientList';
import AlertPanel from '../components/CHEW/AlertPanel';

export default function CHEWPortal() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header specific to CHEW */}
      <div className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-primary-500 text-slate-900 text-sm px-2 py-0.5 rounded uppercase tracking-wider font-extrabold">CHEW</span>
              SanadHealth Portal
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Monitoring coverage for: {user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Alerts Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex w-3 h-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500"></span>
              </span>
              Priority Action Items
            </h2>
            <AlertPanel />
          </div>

          {/* Patients Column */}
          <div className="space-y-6">
            <PatientList />
          </div>
          
        </div>
      </div>
    </div>
  );
}
```

## client/src/pages/Dashboard.jsx
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HealthSummary from '../components/Dashboard/HealthSummary';
import ReadingChart from '../components/Dashboard/ReadingChart';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [meRes, assessRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/assessments')
        ]);
        setProfile(meRes.data.profile);
        setAssessments(assessRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  const latestAssessment = assessments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}</h1>
          <p className="text-slate-500 mt-1">Here is your health snapshot for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/assessment"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-primary-700 transition"
          >
            Take Assessment
          </Link>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
            Sign out
          </button>
        </div>
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold">Complete your profile</h3>
            <p className="text-sm">You need a complete health profile before taking AI assessments.</p>
          </div>
          {/* We'll skip building the full profile form for time, assume user enters dummy data or we auto-gen via API */}
          <button className="bg-amber-600 px-4 py-2 rounded-lg text-white font-medium text-sm">Setup Profile</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HealthSummary profile={profile} latestAssessment={latestAssessment} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Blood Sugar Trends</h2>
            <ReadingChart />
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Advice Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary-500/20 blur-2xl"></div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">✨</span> Claude Advice
            </h2>
            
            {latestAssessment ? (
              <div className="mt-4">
                <p className="text-slate-200 text-sm leading-relaxed mb-4">
                  "{latestAssessment.aiRecommendation}"
                </p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wide">Action Items</h4>
                  <ul className="space-y-2">
                    {(latestAssessment.recommendations || []).map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary-400">•</span>
                        <span className="text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-slate-400 text-sm">
                Take your first health assessment to receive AI-powered personalized recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## client/src/pages/Home.jsx
```jsx
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, ChartBarIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'AI Risk Assessment',
    description: 'Get instant feedback on your diabetes and hypertension risks using our advanced medical AI trained for the Nigerian context.',
    icon: ChartBarIcon,
  },
  {
    name: 'CHEW Monitoring',
    description: 'Community Health Extension Workers can monitor high-risk patients remotely and receive instant SMS alerts for critical readings.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Daily Tracking',
    description: 'Log your blood sugar, blood pressure, and weight daily to visualize your health trends over time with easy-to-read charts.',
    icon: HeartIcon,
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to={user.role === 'CHEW' ? '/chew' : '/dashboard'} replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-primary-200">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/50 text-primary-700 text-sm font-semibold tracking-wide mb-8 border border-primary-200/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Now powered by Gemini AI
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
              Preventive Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">
                Reimagined.
              </span>
            </h1>
            
            <p className="text-lg leading-relaxed text-slate-600 mb-10 max-w-xl">
              SanadHealth connects patients with intelligent risk assessments and Community Health Extension Workers (CHEWs) for proactive management of hypertension and diabetes in Nigeria.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary-600 px-8 py-4 text-white font-semibold transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5"
              >
                <span>Take Assessment Free</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-6 py-4 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-sm font-medium text-slate-500">Trusted by:</span>
              {/* Dummy logos */}
              <div className="h-6 w-24 bg-slate-300 rounded opacity-50 block"></div>
              <div className="h-6 w-20 bg-slate-300 rounded opacity-50 block"></div>
              <div className="h-6 w-28 bg-slate-300 rounded opacity-50 block"></div>
            </div>
          </motion.div>

          {/* Right Image/Dashboard Mockup Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative hidden xl:block"
          >
            {/* Main Floating Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/40 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" 
                alt="Medical Professional using AI tablet" 
                className="w-full h-[600px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Floating Glass UI Card 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-12 top-24 bg-white/80 p-5 rounded-2xl shadow-xl border border-white/60 backdrop-blur-xl max-w-[220px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <HeartIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Blood Pressure</p>
                  <p className="font-bold text-slate-900 leading-none">120/80</p>
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">✓ Normal range</p>
            </motion.div>

            {/* Floating Glass UI Card 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 bottom-32 bg-slate-900/90 p-5 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl text-white max-w-[240px]"
            >
              <h4 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-1">✨ AI Risk Analysis</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on recent updates, patient diabetes risk is <span className="text-yellow-400 font-bold">Medium</span>. Recommend increasing light exercise.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Modern Feature Grid */}
      <div className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
          <div className="mb-16">
            <h2 className="text-sm font-extrabold tracking-widest uppercase text-primary-600 mb-3">Intelligent Infrastructure</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">
              Complete patient lifecycle management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## client/src/services/api.js
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global 401s (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
```

## client/tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        dark: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

## client/vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## package.json
```json
{
  "dependencies": {
    "@google/genai": "^1.48.0"
  }
}
```

## server/src/lib/prisma.js
```js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

