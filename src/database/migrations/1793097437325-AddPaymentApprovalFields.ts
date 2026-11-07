import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentApprovalFields1793097437325 implements MigrationInterface {
    name = 'AddPaymentApprovalFields1793097437325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "status" "public"."payments_status_enum" NOT NULL DEFAULT 'SUBMITTED'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "rejection_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "rejection_reason"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    }

}
