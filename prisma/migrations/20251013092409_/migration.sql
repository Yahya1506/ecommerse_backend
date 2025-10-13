/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `feedbacks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_user_id_product_id_key" ON "feedbacks"("user_id", "product_id");
