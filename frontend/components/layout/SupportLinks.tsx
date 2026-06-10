import { UNIFORM_FOOTER_BUTTON_CLASS, UNIFORM_HEADER_BUTTON_CLASS } from '../../utils/ui/uiConstants';

type SupportLinksVariant = 'primary' | 'secondary' | 'all';
type SupportLinksLayout = 'footer' | 'header';

export const SupportLinks: React.FC<{
  variant?: SupportLinksVariant;
  layout?: SupportLinksLayout;
  className?: string;
  primaryMiddleSlot?: React.ReactNode;
  primaryRightSlot?: React.ReactNode;
}> = ({ variant = 'all', layout = 'footer', className, primaryMiddleSlot, primaryRightSlot }) => {
  const uniformButtonClass = layout === 'header' ? UNIFORM_HEADER_BUTTON_CLASS : UNIFORM_FOOTER_BUTTON_CLASS;

  const showPrimary = variant === 'all' || variant === 'primary';
  const showSecondary = variant === 'all' || variant === 'secondary';

  const primaryContainerClass =
    layout === 'header'
      ? 'flex flex-wrap items-center justify-end gap-2'
      : 'flex flex-wrap w-full items-center justify-center gap-2';

  const secondaryContainerClass =
    layout === 'header'
      ? 'flex flex-wrap items-center gap-2'
      : 'flex flex-wrap w-full items-center justify-center gap-2';

  const content = (
    <>
      {showPrimary && (
        <div className={primaryContainerClass}>


          {primaryMiddleSlot}

          {primaryRightSlot ? (
            <div className="ml-10 pr-2 shrink-0">
              {primaryRightSlot}
            </div>
          ) : null}
        </div>
      )}

      {showSecondary && (
        <div className={secondaryContainerClass}>
        </div>
      )}
    </>
  );

  if (layout === 'header') {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={`  ${className ?? ''}`.trim()}>
      <div className="flex flex-col items-stretch gap-4">
        <div className="flex flex-col items-stretch justify-center gap-3">{content}</div>
      </div>
    </div>
  );
};
