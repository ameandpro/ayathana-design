import {forwardRef, type AnchorHTMLAttributes} from 'react';
import {Link as RouterLink, Navigate, Route, Routes} from 'react-router-dom';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {ToastViewport} from '@astryxdesign/core/Toast';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import jaJP from '@astryxdesign/core/locales/ja-JP.generated.js';
import {AyatanaHome} from './ayatana/AyatanaHome';
import {AyatanaManagerHome} from './ayatana/AyatanaManagerHome';
import {AyatanaMember} from './ayatana/AyatanaMember';
import {ManagerHomeStacked} from './ayatana/manager/ManagerHomeStacked';
import {MemberYamada} from './ayatana/manager/MemberYamada';
import {ManagerFeed} from './ayatana/manager/ManagerFeed';

// Astryx の Link は href を渡す。react-router の Link は to で受けるので橋渡しする。
const AppLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & {href?: string}>(
  function AppLink({href = '#', ...rest}, ref) {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return <a ref={ref} href={href} {...rest} />;
    return <RouterLink ref={ref} to={href} {...rest} />;
  },
);

export function App() {
  return (
    <InternationalizationProvider locale="ja-JP" messages={{'ja-JP': jaJP}}>
      <Theme theme={neutralTheme} mode="light">
        <LinkProvider component={AppLink}>
          <ToastViewport position="bottomEnd">
            <Routes>
              <Route path="/ayatana-home" element={<AyatanaHome />} />
              <Route path="/ayatana-member" element={<AyatanaMember />} />
              <Route path="/ayatana-manager" element={<AyatanaManagerHome />} />
              <Route path="/ayatana-manager-stacked" element={<ManagerHomeStacked />} />
              {/* チャットを開いた状態（話題なしは次回までのアクション）。ホームと同じ部品なので行き来しても本文を作り直さない */}
              <Route path="/ayatana-manager-chat/:topic?" element={<ManagerHomeStacked />} />
              <Route path="/ayatana-member-yamada" element={<MemberYamada />} />
              <Route path="/ayatana-feed" element={<ManagerFeed />} />
              {/* それ以外の道は上司ホームへ */}
              <Route path="*" element={<Navigate to="/ayatana-manager-stacked" replace />} />
            </Routes>
          </ToastViewport>
        </LinkProvider>
      </Theme>
    </InternationalizationProvider>
  );
}
