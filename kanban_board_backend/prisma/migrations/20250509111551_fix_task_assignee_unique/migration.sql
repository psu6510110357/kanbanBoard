/*
  Warnings:

  - A unique constraint covering the columns `[taskId,userId]` on the table `TaskAssignee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignee_taskId_userId_key" ON "TaskAssignee"("taskId", "userId");
