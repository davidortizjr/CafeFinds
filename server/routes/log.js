import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// The "Letterboxd diary" view: every cafe the current user has checked off,
// newest first, with their own review if they left one.
router.get('/', async (req, res, next) => {
  try {
    const visits = await prisma.visit.findMany({
      where: { userId: req.user.id },
      include: {
        cafe: {
          include: {
            reviews: { where: { userId: req.user.id } }
          }
        }
      },
      orderBy: { visitedAt: 'desc' }
    })

    res.json({
      entries: visits.map((v) => ({
        cafeId: v.cafe.id,
        placeId: v.cafe.placeId,
        name: v.cafe.name,
        address: v.cafe.address,
        lat: v.cafe.lat,
        lng: v.cafe.lng,
        visitedAt: v.visitedAt,
        review: v.cafe.reviews[0] ?? null
      }))
    })
  } catch (err) {
    next(err)
  }
})

export default router
