import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma.service';

@Injectable()
export class FindMeetsService {
    constructor(private prismaService: PrismaService) {}

    async execute() {
        try {
            const meets = await this.prismaService.meet.findMany({
                where: {
                    created_at: {
                        gte: new Date().toISOString(),
                    },
                },
            });

            console.log(meets);
        } catch (error) {
            console.log(error);
        }
    }
}
