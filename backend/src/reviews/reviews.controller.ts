// C:\Users\DELL\Desktop\osirix\backend\src\reviews\reviews.controller.ts

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request,
  HttpException,
  HttpStatus 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /reviews/clinic - Noter la clinique OSIRIX
  @Post('clinic')
  async createClinicReview(
    @Request() req,
    @Body() createReviewDto: CreateReviewDto
  ) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      // Forcer le type "clinic" pour cette route
      const reviewData = {
        ...createReviewDto,
        type: 'clinic'
      };

      const result = await this.reviewsService.createReview(userId, reviewData);
      
      return {
        success: true,
        message: result.message,
        data: {
          rating: result.review.rating,
          comment: result.review.comment,
          createdAt: result.review.createdAt,
          isUpdate: !!result.review.updatedAt
        }
      };

    } catch (error) {
      console.error('Erreur création avis clinique:', error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Erreur lors de la création de l\'avis',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GET /reviews/my-reviews - Mes avis donnés
  @Get('my-reviews')
  async getMyReviews(@Request() req) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
      }

      const reviews = await this.reviewsService.getMyReviews(userId);
      
      return {
        success: true,
        data: reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          type: review.type,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        }))
      };

    } catch (error) {
      console.error('Erreur récupération avis:', error.message);
      
      throw new HttpException(
        'Erreur lors de la récupération de vos avis',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // GET /reviews/clinic/stats - Statistiques globales (pour admin)
  @Get('clinic/stats')
  async getClinicStats() {
    try {
      const stats = await this.reviewsService.getClinicStats();
      
      return {
        success: true,
        data: {
          totalReviews: stats.total,
          averageRating: stats.average,
          distribution: {
            1: stats.distribution[1] || 0,
            2: stats.distribution[2] || 0,
            3: stats.distribution[3] || 0,
            4: stats.distribution[4] || 0,
            5: stats.distribution[5] || 0
          }
        }
      };

    } catch (error) {
      console.error('Erreur statistiques avis:', error.message);
      
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}