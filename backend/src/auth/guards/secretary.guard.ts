import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SecretaryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (user.role !== 'SECRETARY') {
      throw new ForbiddenException(
        'Accès refusé : cette fonctionnalité est réservée aux secrétaires'
      );
    }

    return true;
  }
}