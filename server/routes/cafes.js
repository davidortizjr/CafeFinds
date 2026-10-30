import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

// Guests get the same cafe data as everyone else (rating, other people's
// reviews); they just have no visit state or review of their own.
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
    visited: userId ? (cafe.visits ?? []).length > 0 : false,
    myReview: userId ? (cafe.reviews.find((r) => r.userId === userId) ?? null) : null,
    reviews: cafe.reviews
      .filter((r) => r.userId !== userId)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        userName: r.user.name,
        username: r.user.username
      }))
  }
}

function includeFor(userId) {
  return {
    reviews: {
      include: { user: { select: { name: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    },
    // Only this person's own visit is needed to know if they've been.
    ...(userId ? { visits: { where: { userId } } } : {})
  }
}

// Guests can open any cafe. If nobody has logged it yet there is no row, and
// the client shows an empty one built from the Google Places data it already has.
router.get('/:placeId', async (req, res, next) => {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { placeId: req.params.placeId },
      include: includeFor(req.user?.id)
    })
    if (!cafe) return res.status(404).json({ error: 'Cafe not tracked yet' })
    res.json(serializeCafe(cafe, req.user?.id))
  } catch (err) {
    next(err)
  }
})

// Find-or-create a cafe from Google Place data. Only signed-in people can
// create rows, which keeps guests from filling the database just by browsing.
// Existing cafes are never overwritten from client input.
router.post('/upsert', requireAuth, async (req, res, next) => {
  try {
    const { placeId, name, address, lat, lng } = req.body ?? {}
    if (!placeId || !name || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ error: 'placeId, name, lat and lng are required' })
    }

    const cafe = await prisma.cafe.upsert({
      where: { placeId },
      update: {},
      create: {
        placeId: String(placeId).slice(0, 300),
        name: String(name).slice(0, 200),
        address: address ? String(address).slice(0, 300) : null,
        lat,
        lng
      },
      include: includeFor(req.user.id)
    })

    res.json(serializeCafe(cafe, req.user.id))
  } catch (err) {
    next(err)
  }
})

export default router
