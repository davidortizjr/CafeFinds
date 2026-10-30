import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Public profile: anyone can see a person's name, bio, stats and reviews.
// Visits that have no review stay private — only the count is shown.
router.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.params.username.toLowerCase() } })
    if (!user) return res.status(404).json({ error: 'No one here by that username.' })

    const [reviews, visited] = await Promise.all([
      prisma.review.findMany({
        where: { userId: user.id },
        include: { cafe: { select: { placeId: true, name: true, address: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.visit.count({ where: { userId: user.id } })
    ])

    const avgRating = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null

    res.json({
      user: { username: user.username, name: user.name, bio: user.bio, joinedAt: user.createdAt },
      isMe: req.user?.id === user.id,
      stats: { visited, reviewed: reviews.length, avgRating },
      reviews: reviews.slice(0, 50).map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        cafe: r.cafe
      }))
    })
  } catch (err) {
    next(err)
  }
})

export default router
