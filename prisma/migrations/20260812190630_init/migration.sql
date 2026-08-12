-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'You',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cafe" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceId_key" ON "User"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Cafe_placeId_key" ON "Cafe"("placeId");

-- CreateIndex
CREATE INDEX "Cafe_lat_lng_idx" ON "Cafe"("lat", "lng");

-- CreateIndex
CREATE INDEX "Review_cafeId_idx" ON "Review"("cafeId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_cafeId_key" ON "Review"("userId", "cafeId");

-- CreateIndex
CREATE INDEX "Visit_cafeId_idx" ON "Visit"("cafeId");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_userId_cafeId_key" ON "Visit"("userId", "cafeId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
