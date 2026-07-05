import { Types } from 'mongoose';
import { Notification, NotificationType } from '../models/Notification';
import { User } from '../models/User';
import { sendMail, isMailerConfigured } from '../config/mailer';
import { logger } from '../config/logger';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  /** When true, also send an email. Defaults to true. */
  sendEmail?: boolean;
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(opts: {
  title: string;
  message: string;
  link?: string;
  name?: string;
}): string {
  const safeLink = opts.link ? htmlEscape(opts.link) : '';
  const greeting = opts.name ? `Hi ${htmlEscape(opts.name)},` : 'Hi,';
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #0f172a;">${htmlEscape(opts.title)}</h2>
      <p style="color: #334155; line-height: 1.6;">${greeting}</p>
      <p style="color: #334155; line-height: 1.6;">${htmlEscape(opts.message)}</p>
      ${
        safeLink
          ? `<p style="margin-top: 24px;"><a href="${safeLink}" style="background: #0f172a; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none;">View details</a></p>`
          : ''
      }
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">
        Pixel Club Management Portal · GCE Karad
      </p>
    </div>
  `;
}

/**
 * Creates an in-app notification and (best-effort) sends an email.
 * Email failures are recorded on the notification but never thrown.
 */
export async function notifyUser(input: CreateNotificationInput): Promise<void> {
  try {
    const shouldEmail = input.sendEmail !== false;
    const user = await User.findById(input.userId).select('email name').lean();

    const notification = await Notification.create({
      userId: new Types.ObjectId(input.userId),
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      emailSent: false,
    });

    if (!shouldEmail || !user || !isMailerConfigured()) {
      return;
    }

    try {
      await sendMail({
        to: user.email,
        subject: input.title,
        html: buildEmailHtml({
          title: input.title,
          message: input.message,
          link: input.link,
          name: user.name,
        }),
        text: `${input.title}\n\n${input.message}${input.link ? `\n\nOpen: ${input.link}` : ''}`,
      });
      notification.emailSent = true;
      await notification.save();
    } catch (err) {
      notification.emailSent = false;
      notification.emailError = (err as Error).message;
      await notification.save();
      logger.error(
        { err, notificationId: notification._id.toString() },
        'Failed to send notification email'
      );
    }
  } catch (err) {
    logger.error({ err, type: input.type }, 'Failed to create notification');
  }
}
