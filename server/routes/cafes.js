import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

function serializeCafe(cafe, userId) {
  const ratings = cafe.reviews.map((r) => r.rating)
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null

  return {
    id: cafe.id,
    placeId: cafe.placeId,
    name: cafe.name,
    address: cafe.address,
    lat: cafe.lat,
    lng: cafe.lng,
    avgRating,
    reviewCount: ratings.length,
    visited: cafe.visits.some((v) => v.userId === userId),
    myReview: cafe.reviews.find((r) => r.userId === userId) ?? null,
    reviews: cafe.reviews
      .filter((r) => r.userId !== userId)
      .map((r) => ({ id: r.id, rating: r.rating, text: r.text, createdAt: r.createdAt, userName: r.user.name }))
  }
}

const include = {
  reviews: { include: { user: true } },
  visits: true
}

// Find-or-create a cafe from Google Place data, then return it fully hydrated.
// The client calls this the first time a place is opened so every cafe in
// our DB always originates from a real Google Place.
router.post('/upsert', async (req, res, next) => {
  try {
    const { placeId, name, address, lat, lng } = req.body
    if (!placeId || !name || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'placeId, name, lat and lng are required' })
    }

    const cafe = await prisma.cafe.upsert({
      where: { placeId },
      update: { name, address, lat, lng },
      create: { placeId, name, address, lat, lng },
      include
    })

    res.json(serializeCafe(cafe, req.user.id))
  } catch (err) {
    next(err)
  }
})

router.get('/:placeId', async (req, res, next) => {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { placeId: req.params.placeId },
      include
    })
    if (!cafe) return res.status(404).json({ error: 'Cafe not tracked yet' })
    res.json(serializeCafe(cafe, req.user.id))
  } catch (err) {
    next(err)
  }
})

export default router
