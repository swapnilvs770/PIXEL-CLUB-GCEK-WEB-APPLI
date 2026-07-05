import { Users, Linkedin, Instagram, Twitter, Globe, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useActiveTeam, TeamMember } from '@/api/team';

export default function TeamPage() {
  const { data: batch, isLoading } = useActiveTeam();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!batch) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No active team batch yet. An admin needs to create and activate one.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-7 w-7" /> Our team
        </h1>
        <p className="text-muted-foreground">
          {batch.batchName} · {batch.batchYear}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {batch.members.map((m) => (
          <MemberCard key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}

function MemberCard({ m }: { m: TeamMember }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-secondary">
        {m.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.photoUrl}
            alt={m.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-muted-foreground">
            {m.name
              .split(' ')
              .slice(0, 2)
              .map((s) => s[0])
              .join('')
              .toUpperCase()}
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <p className="truncate font-semibold">{m.name}</p>
        <p className="truncate text-xs text-muted-foreground">{m.designation}</p>
        {m.bio && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{m.bio}</p>}
        {m.contributions.length > 0 && (
          <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
            {m.contributions.slice(0, 3).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
            {m.contributions.length > 3 && (
              <li className="list-none italic">+{m.contributions.length - 3} more</li>
            )}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-1">
          {m.socials.instagram && <SocialIcon href={m.socials.instagram} Icon={Instagram} />}
          {m.socials.linkedin && <SocialIcon href={m.socials.linkedin} Icon={Linkedin} />}
          {m.socials.twitter && <SocialIcon href={m.socials.twitter} Icon={Twitter} />}
          {m.socials.website && <SocialIcon href={m.socials.website} Icon={Globe} />}
          {m.socials.other && <SocialIcon href={m.socials.other} Icon={LinkIcon} />}
        </div>
      </CardContent>
    </Card>
  );
}

function SocialIcon({ href, Icon }: { href: string; Icon: typeof Linkedin }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}
