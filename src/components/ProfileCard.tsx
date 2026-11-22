import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  avatarSrc,
  joinedLabel,
  profileName,
  showWebsite,
  SOCIAL_PLATFORMS,
  WEBSITE_ICON,
  type PublicProfile,
} from '@/lib/profiles';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

interface ProfileCardProps {
  profile: Omit<PublicProfile, 'id' | 'isPublic' | 'showEntries'>;
  /** h1 on the profile page; h2 in the editor's preview. */
  headingLevel?: 1 | 2;
  headingId?: string;
  /** Extra lines under the bio (stats, share button). */
  children?: ReactNode;
}

/** The top of a public profile: picture, name, pronouns, bio and links. */
export function ProfileCard({ profile, headingLevel = 1, headingId, children }: ProfileCardProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const name = profileName(profile);
  const hasDisplayName = !!profile.displayName.trim();
  const links = SOCIAL_PLATFORMS.filter((p) => profile.links[p.id]);
  const hasLinks = !!profile.website || links.length > 0;
  const joined = joinedLabel(profile.createdAt);

  return (
    <section className="profile-card" aria-labelledby={headingId}>
      <Avatar src={avatarSrc(profile)} name={name} size="xl" className="profile-card__avatar" />
      <div className="profile-card__body">
        <Heading id={headingId} className="profile-card__name">
          {name}
        </Heading>
        {/* Without a display name, the heading already is the @username. */}
        {(hasDisplayName || profile.pronouns.trim()) && (
          <p className="profile-card__handle">
            {hasDisplayName && <span>@{profile.username}</span>}
            {hasDisplayName && profile.pronouns.trim() && <span aria-hidden="true"> · </span>}
            {profile.pronouns.trim() && (
              <span>
                <span className="sr-only">Pronouns: </span>
                {profile.pronouns}
              </span>
            )}
          </p>
        )}
        {profile.bio.trim() && <p className="profile-card__bio">{profile.bio}</p>}

        {hasLinks && (
          <ul className="profile-links" aria-label="Links">
            {profile.website && (
              <li>
                <a href={profile.website} className="profile-link" rel="me nofollow ugc noopener noreferrer">
                  <Icon icon={WEBSITE_ICON} size={18} />
                  <span className="sr-only">Website: </span>
                  <span className="profile-link__text">{showWebsite(profile.website)}</span>
                </a>
              </li>
            )}
            {links.map((p) => (
              <li key={p.id}>
                <a href={p.href(profile.links[p.id])} className="profile-link" rel="me nofollow ugc noopener noreferrer">
                  <Icon icon={p.icon} size={18} />
                  <span className="sr-only">{p.label}: </span>
                  <span className="profile-link__text">{p.show(profile.links[p.id])}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {joined && (
          <p className="profile-card__joined">
            <Icon icon={CalendarDays} size={16} />
            {joined}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
