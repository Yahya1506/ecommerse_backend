/*
  Warnings:

  - A unique constraint covering the columns `[cat_name]` on the table `catagories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "catagories_cat_name_key" ON "catagories"("cat_name");
