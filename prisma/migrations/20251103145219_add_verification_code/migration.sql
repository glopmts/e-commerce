-- CreateTable
CREATE TABLE "verificationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "verificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verificationCode_code_key" ON "verificationCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "verificationCode_email_key" ON "verificationCode"("email");
