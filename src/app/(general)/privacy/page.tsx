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
import { CONTACT_EMAIL, DATA_DELETION_ANCHOR, DATA_DELETION_DAYS } from '@/constants/Site';

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const strong = { strong: (chunks: React.ReactNode) => <strong>{chunks}</strong> };

  return (
    <LegalPage agreement={t('agreement')} title={t('title')} lastUpdated={t('lastUpdated')}>
      <LegalIntro>{t('intro')}</LegalIntro>
      <LegalCallout>{t('summary')}</LegalCallout>

      <LegalSection title={t('sections.controller.title')}>
        <LegalText>{t('sections.controller.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.dataCollection.title')}>
        <LegalText>{t('sections.dataCollection.description')}</LegalText>

        <LegalSubtitle>{t('sections.dataCollection.account.title')}</LegalSubtitle>
        <LegalText>{t('sections.dataCollection.account.description')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.dataCollection.account.email')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.account.profile')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.account.uploads')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.account.tokens')}</LegalItem>
        </LegalList>

        <LegalSubtitle>{t('sections.dataCollection.activity.title')}</LegalSubtitle>
        <LegalText>{t('sections.dataCollection.activity.description')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.dataCollection.activity.sessions')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.activity.tasks')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.activity.stats')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.activity.settings')}</LegalItem>
        </LegalList>

        <LegalSubtitle>{t('sections.dataCollection.technical.title')}</LegalSubtitle>
        <LegalText>{t('sections.dataCollection.technical.description')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.dataCollection.technical.device')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.technical.network')}</LegalItem>
          <LegalItem>{t('sections.dataCollection.technical.logs')}</LegalItem>
        </LegalList>

        <LegalCallout>{t('sections.dataCollection.noSensitive')}</LegalCallout>
      </LegalSection>

      <LegalSection title={t('sections.purpose.title')}>
        <LegalText>{t('sections.purpose.description')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.purpose.operate')}</LegalItem>
          <LegalItem>{t('sections.purpose.account')}</LegalItem>
          <LegalItem>{t('sections.purpose.features')}</LegalItem>
          <LegalItem>{t('sections.purpose.secure')}</LegalItem>
          <LegalItem>{t('sections.purpose.improve')}</LegalItem>
          <LegalItem>{t('sections.purpose.legal')}</LegalItem>
        </LegalList>
        <LegalText>{t('sections.purpose.noSale')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.access.title')}>
        <LegalText>{t('sections.access.description')}</LegalText>
        <LegalText>{t('sections.access.scope')}</LegalText>
        <LegalCallout>{t('sections.access.warning')}</LegalCallout>
      </LegalSection>

      <LegalSection title={t('sections.processors.title')}>
        <LegalText>{t('sections.processors.description')}</LegalText>
        <LegalText>{t('sections.processors.list')}</LegalText>
        <LegalList>
          <LegalItem>{t.rich('sections.processors.firebase', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.processors.analyticsProvider', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.processors.google', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.processors.vercel', strong)}</LegalItem>
        </LegalList>
        <LegalText>{t('sections.processors.policies')}</LegalText>
        <LegalText>{t('sections.processors.responsibility')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.cookies.title')}>
        <LegalText>{t('sections.cookies.description')}</LegalText>
        <LegalList>
          <LegalItem>{t.rich('sections.cookies.essential', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.cookies.preference', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.cookies.consent', strong)}</LegalItem>
          <LegalItem>{t.rich('sections.cookies.analytics', strong)}</LegalItem>
        </LegalList>
        <LegalText>{t('sections.cookies.control')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.analytics.title')}>
        <LegalText>{t('sections.analytics.intro')}</LegalText>
        <LegalText>{t('sections.analytics.analytics')}</LegalText>
        <LegalText>{t.rich('sections.analytics.analyticsPurpose', strong)}</LegalText>
        <LegalCallout>{t('sections.analytics.analyticsConsent')}</LegalCallout>
      </LegalSection>

      <LegalSection title={t('sections.sharing.title')}>
        <LegalText>{t('sections.sharing.description')}</LegalText>
        <LegalList>
          <LegalItem>{t('sections.sharing.providers')}</LegalItem>
          <LegalItem>{t('sections.sharing.legal')}</LegalItem>
          <LegalItem>{t('sections.sharing.security')}</LegalItem>
          <LegalItem>{t('sections.sharing.rights')}</LegalItem>
        </LegalList>
        <LegalText>{t('sections.sharing.public')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.security.title')}>
        <LegalText>{t('sections.security.description')}</LegalText>
        <LegalText>{t('sections.security.warning')}</LegalText>
      </LegalSection>

      <LegalSection id={DATA_DELETION_ANCHOR} title={t('sections.retention.title')}>
        <LegalText>{t('sections.retention.description')}</LegalText>

        <LegalText>
          {t.rich('sections.retention.deletion', {
            email: CONTACT_EMAIL,
            mail: (chunks) => <LegalEmail email={CONTACT_EMAIL}>{chunks}</LegalEmail>,
          })}
        </LegalText>

        <LegalCallout>{t('sections.retention.requirement')}</LegalCallout>

        <LegalText>{t('sections.retention.term', { days: DATA_DELETION_DAYS })}</LegalText>
        <LegalText>{t('sections.retention.irreversible')}</LegalText>
        <LegalText>{t('sections.retention.exceptions')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.rights.title')}>
        <LegalText>{t('sections.rights.description')}</LegalText>
        <LegalText>{t('sections.rights.exercise')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.children.title')}>
        <LegalText>{t('sections.children.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.international.title')}>
        <LegalText>{t('sections.international.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.changes.title')}>
        <LegalText>{t('sections.changes.description')}</LegalText>
      </LegalSection>

      <LegalSection title={t('sections.contact.title')}>
        <LegalText>{t('sections.contact.info')}</LegalText>
        <LegalEmail email={CONTACT_EMAIL} />
      </LegalSection>

      <LegalFinalNotice>
        {t.rich('finalNotice', {
          deletion: (chunks) => <LegalLink href={`#${DATA_DELETION_ANCHOR}`}>{chunks}</LegalLink>,
        })}
      </LegalFinalNotice>
    </LegalPage>
  );
}
