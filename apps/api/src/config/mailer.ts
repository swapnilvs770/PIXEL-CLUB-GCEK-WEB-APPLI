import nodemailer, { Transporter } from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

let transporter: Transporter | null = null;

export function configureMailer(): void {
  if (transporter) return;
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('SMTP credentials missing — email notifications will be disabled.');
    return;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('Mailer configured');
}

export function isMailerConfigured(): boolean {
  return transporter !== null;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!transporter) {
    logger.warn({ to: opts.to, subject: opts.subject }, 'Mail skipped — mailer not configured');
    return;
  }
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
