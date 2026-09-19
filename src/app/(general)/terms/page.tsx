'use client';

import { useTranslations } from 'next-intl';
import {
  LegalCallout,
  LegalEmail,
  LegalFinalNotice,
  LegalIntro,
  LegalItem,
  LegalLink,
  LegalList,
  LegalPage,
  LegalSection,
  LegalSubtitle,
  LegalText,
} from '@/components/Legal';
import { Link as ChakraLink } from '@chakra-ui/react';
import { BMC_SLUG, CONTACT_EMAIL, DATA_DELETION_ANCHOR } from '@/constants/Site';

export default function TermsPage() {
  const t = useTranslations('terms');
  const strong = { strong: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

  const bmc = {
    bmc: (chunks: React.ReactNode) => (
      <ChakraLink
        href={`https://www.buymeacoffee.com/${BMC_SLUG}`}
        target='_blank'
        rel='noopener noreferrer'
        fontWeight='bold'
        textDecoration='underline'
      >
        {chunks}
      </ChakraLink>
    ),
  };

  return (
    <LegalPage agreement={t('agreement')} title={t('title')} lastUpdated={t('lastUpdated')}>
      <LegalIntro>{t('intro')}</LegalIntro>

      <LegalSection title={t('sections.definitions.title')}>
        <LegalList>
          <LegalItem>{t.rich('sections.definitions.items.app', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.definitions.items.operator', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.definitions.items.user', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.definitions.items.content', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.definitions.items.userContent', strong)}</LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection title={t('sections.eligibility.title')}>
        <LegalText>{t('sections.eligibility.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.usage.title')}>
        <LegalText>{t('sections.usage.commitments')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.usage.legalUse')}</LegalItem>
          <LegalItem>{t('sections.usage.noCopy')}</LegalItem>
          <LegalItem>{t('sections.usage.noAbuse')}</LegalItem>
        </LegalList>

        <LegalText>{t('sections.usage.prohibited')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.usage.fraudulentUse')}</LegalItem>
          <LegalItem>{t('sections.usage.unauthorizedAccess')}</LegalItem>
          <LegalItem>{t('sections.usage.manipulation')}</LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection title={t('sections.accounts.title')}>
        <LegalText>{t('sections.accounts.description')}</LegalText>
        <LegalText>{t('sections.accounts.suspension')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.userContent.title')}>
        <LegalText>{t('sections.userContent.description')}</LegalText>
        <LegalText>{t('sections.userContent.warning')}</LegalText>
        <LegalText>{t('sections.userContent.public')}</LegalText>

        <LegalSubtitle>{t('sections.userContent.uploads.title')}</LegalSubtitle>
        <LegalText>{t('sections.userContent.uploads.rights')}</LegalText>
        <LegalText>{t('sections.userContent.uploads.consent')}</LegalText>
        <LegalText>{t('sections.userContent.uploads.responsibility')}</LegalText>
        <LegalText>{t('sections.userContent.uploads.prohibited')}</LegalText>
        <LegalCallout>{t('sections.userContent.uploads.moderation')}</LegalCallout>
      </LegalSection>

      <LegalSection title={t('sections.availability.title')}>
        <LegalText>{t('sections.availability.description')}</LegalText>
        <LegalText>{t('sections.availability.noUptime')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.data.title')}>
        <LegalText>{t('sections.data.accuracy')}</LegalText>
        <LegalText>{t('sections.data.metrics')}</LegalText>
        <LegalText>{t('sections.data.backups')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.leaderboard.title')}>
        <LegalText>{t('sections.leaderboard.automatic')}</LegalText>
        <LegalText>{t('sections.leaderboard.monitoring')}</LegalText>
        <LegalText>{t('sections.leaderboard.warning')}</LegalText>
        <LegalText>{t('sections.leaderboard.suspension')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.payments.title')}>
        <LegalText>{t('sections.payments.free')}</LegalText>
        <LegalText>{t('sections.payments.noProcessing')}</LegalText>
        <LegalCallout>{t.rich('sections.payments.warning', strong)}</LegalCallout>
        <LegalText>{t('sections.payments.report')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.donations.title')}>
        <LegalText>{t.rich('sections.donations.voluntary', bmc)}</LegalText>
        <LegalText>{t('sections.donations.noFunctional')}</LegalText>
        <LegalText>{t('sections.donations.badge')}</LegalText>
        <LegalText>{t('sections.donations.exclusive')}</LegalText>
        <LegalCallout>
          {t.rich('sections.donations.previous', {
            email: CONTACT_EMAIL,
            mail: (chunks) => <LegalEmail email={CONTACT_EMAIL}>{chunks}</LegalEmail>,
          })}
        </LegalCallout>
      </LegalSection>

      <LegalSection title={t('sections.intellectual.title')}>
        <LegalText>{t('sections.intellectual.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.f1.title')}>
        <LegalText>{t('sections.f1.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.thirdParties.title')}>
        <LegalText>{t('sections.thirdParties.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.changes.title')}>
        <LegalText>{t('sections.changes.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.limitation.title')}>
        <LegalText>{t('sections.limitation.intro')}</LegalText>
        <LegalText>{t('sections.limitation.noWarranty')}</LegalText>
        <LegalText>{t('sections.limitation.notResponsible')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.limitation.damage')}</LegalItem>
          <LegalItem>{t('sections.limitation.loss')}</LegalItem>
          <LegalItem>{t('sections.limitation.interruption')}</LegalItem>
          <LegalItem>{t('sections.limitation.thirdParty')}</LegalItem>
          <LegalItem>{t('sections.limitation.decisions')}</LegalItem>
        </LegalList>
        <LegalText>{t('sections.limitation.cap')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.indemnity.title')}>
        <LegalText>{t('sections.indemnity.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.termination.title')}>
        <LegalText>{t('sections.termination.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.severability.title')}>
        <LegalText>{t('sections.severability.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.law.title')}>
        <LegalText>{t('sections.law.law')}</LegalText>
        <LegalText>{t('sections.law.jurisdiction')}</LegalText>
        <LegalText>{t('sections.law.consumer')}</LegalText>
        <LegalText>{t('sections.law.language')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.contact.title')}>
        <LegalText>{t('sections.contact.info')}</LegalText>
        <LegalEmail email={CONTACT_EMAIL} />
      </LegalSection>

      <LegalFinalNotice>
        {t.rich('finalNotice', {
          deletion: (chunks) => (
            <LegalLink href={`/privacy#${DATA_DELETION_ANCHOR}`}>{chunks}</LegalLink>
          ),
        })}
      </LegalFinalNotice>
    </LegalPage>
  );
}
