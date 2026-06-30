import { useTranslation } from 'react-i18next';

import { ScreenLoadingView } from '../../../components';

function ReviewLogLoadingView() {
  const { t } = useTranslation();

  return (
    <ScreenLoadingView caption={t('review.list.loadingCaption')} minHeight={320} />
  );
}

export default ReviewLogLoadingView;
