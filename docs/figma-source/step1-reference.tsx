const assetPathPrefix = "https://www.figma.com/api/mcp/asset/eb83cf93-b583-42aa-b602-245f8e579822";
const imgNameFacebookStatusHover = `${assetPathPrefix}/2f5b4.svg`;
const imgNameLinkedlnStatusHover = `${assetPathPrefix}/aff16.svg`;
const imgNameYoutubeStatusHover = `${assetPathPrefix}/3762c.svg`;
const imgNameInstagramStatusHover = `${assetPathPrefix}/0f7cb.svg`;
const imgCopeland = `${assetPathPrefix}/2b749.svg`;
const imgSensiSmartThermostatCb1 = `${assetPathPrefix}/2b553.png`;
const imgSensiSmartThermostatCb2 = `${assetPathPrefix}/3583f.png`;
const imgSensiSmartThermostatCb3 = `${assetPathPrefix}/35cf0.png`;
const imgSensiSmartThermostatCb4 = `${assetPathPrefix}/5dc25.png`;
const imgSensiSmartThermostatCb5 = `${assetPathPrefix}/6acfd.png`;
const imgSensiSmartThermostatCb6 = `${assetPathPrefix}/9c8c8.png`;
const imgSensiSmartThermostatCb7 = `${assetPathPrefix}/99cfc.png`;
const imgSensiSmartThermostatCb8 = `${assetPathPrefix}/26258.png`;
const imgSensiSmartThermostatCb9 = `${assetPathPrefix}/d6c02.png`;
const imgSensiSmartThermostatCb10 = `${assetPathPrefix}/50ef6.png`;
const imgSensiSmartThermostatCb11 = `${assetPathPrefix}/82d17.png`;
const imgSensiSmartThermostatCb12 = `${assetPathPrefix}/189c1.png`;
const imgSensiSmartThermostatCb13 = `${assetPathPrefix}/c38a9.png`;
const imgSensiSmartThermostatCb14 = `${assetPathPrefix}/e40a7.png`;
const imgCopelandLogoWhite1 = `${assetPathPrefix}/f16f4.png`;
const imgEllipse2 = `${assetPathPrefix}/6ab39.svg`;
const imgGroup48 = `${assetPathPrefix}/136be.svg`;
const imgLine1 = `${assetPathPrefix}/d7223.svg`;
const imgFilledDdlIconSensiIconCircle2 = `${assetPathPrefix}/18ce7.svg`;
const imgLine4 = `${assetPathPrefix}/378ed.svg`;
const imgFilledDdlIconSensiIconCircle4 = `${assetPathPrefix}/5c373.svg`;
const imgVector = `${assetPathPrefix}/d0d14.svg`;
const imgVector1 = `${assetPathPrefix}/ff4e5.svg`;
const imgFilledDdlIconGlobalArrowRight = `${assetPathPrefix}/376bb.svg`;

type SocialButtonsInlineSocialIconsProps = {
  className?: string;
  name?: "Facebook" | "Linkedln" | "Youtube" | "Instagram";
  status?: "Hover";
};

function SocialButtonsInlineSocialIcons({ className, name = "Facebook", status = "Hover" }: SocialButtonsInlineSocialIconsProps) {
  const isInstagramAndHover = name === "Instagram" && status === "Hover";
  const isLinkedlnAndHover = name === "Linkedln" && status === "Hover";
  const isYoutubeAndHover = name === "Youtube" && status === "Hover";
  return (
    <div className={className || `relative ${isYoutubeAndHover ? "h-[37.125px] w-[54px]" : "size-[54px]"}`} id={isInstagramAndHover ? "node-1_942" : isYoutubeAndHover ? "node-1_936" : isLinkedlnAndHover ? "node-1_932" : "node-1_928"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={isInstagramAndHover ? imgNameInstagramStatusHover : isYoutubeAndHover ? imgNameYoutubeStatusHover : isLinkedlnAndHover ? imgNameLinkedlnStatusHover : imgNameFacebookStatusHover} />
    </div>
  );
}

type GlobalFooterSocialIconsProps = {
  className?: string;
  status?: "Hover";
};

function GlobalFooterSocialIcons({ className, status = "Hover" }: GlobalFooterSocialIconsProps) {
  return (
    <div className={className || "content-stretch flex gap-[24px] items-start relative w-[176px]"} data-node-id="1:947">
      <SocialButtonsInlineSocialIcons className="relative shrink-0 size-[26px]" />
      <SocialButtonsInlineSocialIcons className="relative shrink-0 size-[26px]" name="Linkedln" />
      <SocialButtonsInlineSocialIcons className="relative shrink-0 size-[26px]" name="Instagram" />
      <SocialButtonsInlineSocialIcons className="relative shrink-0 size-[26px]" name="Youtube" />
    </div>
  );
}

type GlobalFooterQuickLinksProps = {
  className?: string;
  name?: "Link 1";
  text?: string;
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
};

function GlobalFooterQuickLinks({ className, name = "Link 1", text = "Text", text1 = "Text 1", text2 = "Text 2", text3 = "Text 3", text4 = "Text 4", text5 = "Text 5" }: GlobalFooterQuickLinksProps) {
  return (
    <div className={className || "border-[var(--global-body-text-colors\\/base-reversed,white)] border-b border-solid content-stretch flex flex-col items-start pb-[31px] pt-[44px] relative"} data-node-id="1:871">
      <div className="content-start flex flex-wrap gap-[10px] items-start relative shrink-0" data-node-id="1:872">
        <div className="content-stretch flex h-[24px] items-center justify-center relative shrink-0" data-node-id="1:873">
          <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--programmatic-greyscale\/grey-dark-16,#807e74)] whitespace-nowrap" data-node-id="1:874">
            {text}
          </p>
        </div>
        <div className="content-stretch flex gap-[10px] items-end relative shrink-0" data-node-id="1:875">
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:876">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:877">
              {text1}
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:878">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:879">
              |
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:880">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:881">
              {text2}
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:882">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:883">
              |
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:884">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:885">
              {text3}
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:886">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:887">
              |
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:888">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:889">
              {text4}
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:890">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:891">
              |
            </p>
          </div>
          <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:892">
            <p className="[word-break:break-word] font-['Aileron:Light'] leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="1:893">
              {text5}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type MainNavigationLogoProps = {
  className?: string;
  status?: "Copeland";
};

function MainNavigationLogo({ className, status = "Copeland" }: MainNavigationLogoProps) {
  return (
    <div className={className || "content-stretch flex h-[40px] items-center justify-end relative w-[208px]"} data-node-id="1:32">
      <div className="aspect-[100/10] flex-[1_0_0] min-w-px relative" data-node-id="1:33" data-name="Copeland">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCopeland} />
      </div>
    </div>
  );
}

export default function Step1NoSelection() {
  return (
    <div className="content-stretch flex flex-col isolate items-start relative size-full" data-node-id="121:2753" style={{ backgroundImage: "linear-gradient(90deg, rgba(49, 85, 164, 0.05) 0%, rgba(49, 85, 164, 0.05) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="Step 1 - No selection">
      <div className="content-stretch drop-shadow-[0px_8px_5px_rgba(0,0,0,0.2)] flex flex-col items-center min-w-[1280px] relative shrink-0 w-full z-[5]" data-node-id="144:2189" data-name="Parent Wrapper">
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="144:2192" data-name="Main Nav Wrapper">
          <div className="bg-[var(--interactive-colors\/tertiary,#0c30cc)] content-stretch flex flex-[1_0_0] items-center max-w-[1440px] min-w-px relative" data-node-id="144:2193" data-name="Main Navigation / Nav Bar">
            <div className="content-stretch flex h-[80px] items-center justify-end px-[32px] relative shrink-0" data-node-id="I144:2193;231:1406" data-name="Main Navigation / Logo Lockup">
              <MainNavigationLogo className="content-stretch flex h-[40px] items-center justify-end relative shrink-0 w-[208px]" />
            </div>
            <div className="content-stretch flex flex-[1_0_0] items-center justify-between max-w-[1440px] min-w-px pr-[32px] relative" data-node-id="I144:2193;231:1407">
              <div className="content-stretch flex h-[80px] items-center relative shrink-0" data-node-id="I144:2193;231:1408" data-name="Main Navigation / Core Navigation">
                <div className="content-stretch flex flex-col h-full items-center justify-center mr-[-32px] relative shrink-0" data-node-id="I144:2193;231:1408;231:1324" data-name="Main Navigation / Navigation Item">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px pb-[28px] pt-[27px] px-[32px] relative" data-node-id="I144:2193;231:1408;231:1324;231:1272">
                    <div className="[word-break:break-word] flex flex-col font-['Aileron:Bold'] justify-end leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] text-center whitespace-nowrap" data-node-id="I144:2193;231:1408;231:1324;231:1273">
                      <p className="leading-[24px]">Order History</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0" data-node-id="I144:2193;231:1408;231:1325" data-name="Main Navigation / Navigation Item">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px pb-[28px] pt-[27px] px-[32px] relative" data-node-id="I144:2193;231:1408;231:1325;231:1272">
                    <div className="[word-break:break-word] flex flex-col font-['Aileron:Bold'] justify-end leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--global-body-text-colors\/base-reversed,white)] text-center whitespace-nowrap" data-node-id="I144:2193;231:1408;231:1325;231:1273">
                      <p className="leading-[24px]">FAQ</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex items-center justify-end relative shrink-0" data-node-id="I144:2193;231:1409" data-name="Main Navigation / Icon Navigation">
                <div className="content-stretch flex h-[80px] items-center justify-center px-[15px] relative shrink-0" data-node-id="I144:2193;231:1409;231:1373" data-name="Main Navigation / Icon Nav Item">
                  <div className="relative shrink-0 size-[24px]" data-node-id="I144:2193;231:1409;231:1373;231:1349" data-name="Main Navigation / Icons">
                    <div className="-translate-y-1/2 absolute aspect-[28/28] left-0 right-0 top-1/2" data-node-id="I144:2193;231:1409;231:1373;231:1349;231:1368">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse2} />
                    </div>
                    <div className="[word-break:break-word] absolute bottom-[29.17%] flex flex-col font-['Aileron:Bold'] justify-center leading-[0] left-[1.04%] not-italic right-[-1.04%] text-[10px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] text-center top-1/4" data-node-id="I144:2193;231:1409;231:1373;231:1349;231:1369">
                      <p className="leading-[16px]">JD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center min-w-[1280px] overflow-clip relative shrink-0 w-[1280px] z-[4]" data-node-id="121:2768" data-name="Thank You Page - Desktop (2048)">
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-node-id="121:2769">
          <div className="content-stretch flex flex-col gap-[40px] items-center py-[80px] relative shrink-0 w-full" data-node-id="121:2770">
            <div className="content-stretch flex gap-[10px] items-center px-[50px] relative shrink-0 w-full" data-node-id="121:2771">
              <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="121:2772" data-name="Filled/ddl-icon--sensi-icon-circle-1">
                <div className="relative shrink-0 size-[36px]" data-node-id="121:2773">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup48} />
                </div>
                <div className="[word-break:break-word] flex flex-col font-['Aileron:Bold'] justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--programmatic-greyscale\/grey-dark-48,#2a2a26)] whitespace-nowrap" data-node-id="121:2777">
                  <p className="leading-[24px]">Select Products</p>
                </div>
              </div>
              <div className="flex-[1_0_0] h-0 min-w-px relative" data-node-id="121:2778">
                <div className="absolute inset-[-2px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine1} />
                </div>
              </div>
              <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="121:2779">
                <div className="relative shrink-0 size-[36px]" data-node-id="121:2780" data-name="Filled/ddl-icon--sensi-icon-circle-2">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilledDdlIconSensiIconCircle2} />
                </div>
                <div className="[word-break:break-word] flex flex-col font-['Aileron:Light'] justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--programmatic-greyscale\/grey-dark-48,#2a2a26)] whitespace-nowrap" data-node-id="121:2784">
                  <p className="leading-[24px]">{`Brand & Review`}</p>
                </div>
              </div>
              <div className="flex-[1_0_0] h-0 min-w-px relative" data-node-id="121:2785">
                <div className="absolute inset-[-2px_0_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine4} />
                </div>
              </div>
              <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-node-id="121:2786">
                <div className="relative shrink-0 size-[36px]" data-node-id="121:2787" data-name="Filled/ddl-icon--sensi-icon-circle-4">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilledDdlIconSensiIconCircle4} />
                </div>
                <div className="[word-break:break-word] flex flex-col font-['Aileron:Light'] justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--programmatic-greyscale\/grey-dark-48,#2a2a26)] whitespace-nowrap" data-node-id="121:2791">
                  <p className="leading-[24px]">Complete</p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-start max-w-[1280px] px-[50px] relative shrink-0 w-full" data-node-id="121:2792">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-node-id="121:2793">
                <div className="content-stretch flex flex-col gap-[10px] items-start justify-center relative shrink-0 w-full" data-node-id="121:2794" data-name="Text">
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-node-id="121:2795" data-name="Headline">
                    <p className="[word-break:break-word] font-['Aileron:Bold'] leading-[40px] not-italic relative shrink-0 text-[28px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="121:2796">{`Choose products `}</p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="121:2797" data-name="Subtext">
                    <p className="[word-break:break-word] font-['Aileron:Regular'] leading-[32px] not-italic relative shrink-0 text-[18px] text-[color:var(--programmatic-greyscale\/grey-dark-48,#2a2a26)] whitespace-nowrap" data-node-id="121:2798">{`Select one or more compatible product families. `}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[20px] items-start px-[50px] relative shrink-0 w-full" data-node-id="143:1110">
              <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[32px] not-italic relative shrink-0 text-[22px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="143:1092">
                Product Families
              </p>
              <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-node-id="143:1093">
                <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] border border-[var(--interactive-colors\/cool-grey,#c4ced1)] border-solid content-stretch flex gap-[5px] h-[48px] items-center px-[10px] relative shrink-0 w-[520px]" data-node-id="143:1094">
                  <p className="[word-break:break-word] flex-[1_0_0] font-['Aileron:Regular'] h-[24px] leading-[24px] min-w-px not-italic relative text-[16px] text-[color:var(--programmatic-greyscale\/grey-dark-16,#807e74)]" data-node-id="143:1095">
                    Search products
                  </p>
                  <div className="content-stretch flex items-center relative shrink-0 size-[24px]" data-node-id="143:1096" data-name="Icon">
                    <div className="content-stretch flex flex-[1_0_0] h-full items-center min-w-px relative" data-node-id="143:1097" data-name="outline/ddl-icon--search_new">
                      <div className="content-stretch flex flex-[1_0_0] h-full items-center min-w-px overflow-clip p-[2px] relative" data-node-id="143:1098" data-name="search">
                        <div className="aspect-[16/16] flex-[1_0_0] min-w-px relative" data-node-id="143:1099" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--interactive-colors\/cool-grey,#c4ced1)] border border-[var(--interactive-colors\/cool-grey,#c4ced1)] border-solid content-stretch flex gap-[5px] h-[48px] items-center justify-center px-[15px] relative rounded-[100px] shrink-0 w-[115px]" data-node-id="143:1100">
                  <p className="[word-break:break-word] font-['Aileron:Bold'] leading-[24px] not-italic relative shrink-0 text-[14px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="143:1101">
                    All Products
                  </p>
                </div>
                <div className="border border-[var(--interactive-colors\/cool-grey,#c4ced1)] border-solid content-stretch flex gap-[5px] h-[48px] items-center justify-center px-[15px] relative rounded-[100px] shrink-0 w-[115px]" data-node-id="143:1103">
                  <p className="[word-break:break-word] font-['Aileron:Regular'] leading-[24px] not-italic relative shrink-0 text-[14px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="143:1104">
                    Thermostats
                  </p>
                </div>
                <div className="border border-[var(--interactive-colors\/cool-grey,#c4ced1)] border-solid content-stretch flex gap-[5px] h-[48px] items-center justify-center px-[15px] relative rounded-[100px] shrink-0 w-[115px]" data-node-id="143:1106">
                  <p className="[word-break:break-word] font-['Aileron:Regular'] leading-[24px] not-italic relative shrink-0 text-[14px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="143:1107">
                    Wallplates
                  </p>
                </div>
                <div className="border border-[var(--interactive-colors\/cool-grey,#c4ced1)] border-solid content-stretch flex gap-[5px] h-[48px] items-center justify-center px-[15px] relative rounded-[100px] shrink-0 w-[115px]" data-node-id="144:1117">
                  <p className="[word-break:break-word] font-['Aileron:Regular'] leading-[24px] not-italic relative shrink-0 text-[14px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="144:1118">
                    Other
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[40px] items-start max-w-[1280px] px-[50px] relative shrink-0 w-full" data-node-id="121:2799">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start min-w-px relative" data-node-id="121:2800" data-name="container">
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-node-id="143:1111">
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-node-id="137:947">
                    <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[24px] not-italic relative shrink-0 text-[18px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="137:925">
                      Thermostats
                    </p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-node-id="143:1112">
                    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full" data-node-id="121:2828">
                      <div className="aspect-[233.3333282470703/215] bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] items-start min-w-px p-[20px] relative" data-node-id="121:2829">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2830">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2831" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb1} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2832">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2833">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2834">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2835">
                                <p className="leading-[24px]">Sensi Smart</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[12px]" data-node-id="143:1050" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="aspect-[233.33334350585938/215] bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] items-start min-w-px p-[20px] relative" data-node-id="121:2837">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2838">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2839" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb2} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2840">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2841">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2842">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2843">
                                <p className="leading-[24px]">80 Series</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.67px] size-[26px] top-[12px]" data-node-id="143:1048" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="aspect-[233.33334350585938/215] bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] items-start min-w-px p-[20px] relative" data-node-id="121:2845">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2846">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2847" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb3} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2848">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2849">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2850">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2851">
                                <p className="leading-[24px]">70 Series</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.33px] size-[26px] top-[12px]" data-node-id="143:1046" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[10px] h-[215px] items-start relative shrink-0 w-full" data-node-id="121:2853">
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2854">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2855">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2856" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb4} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2857">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2858">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2859">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2860">
                                <p className="leading-[24px]">{`Classic 80 Series `}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[11.57px]" data-node-id="143:1052" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2861">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2862">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2863" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb5} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2864">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2865">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2866">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2867">
                                <p className="leading-[24px] mb-0">Classic 80 Series</p>
                                <p className="leading-[24px]">Programmable</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.67px] size-[26px] top-[11.57px]" data-node-id="143:1054" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2868">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2869">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2870" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb6} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2871">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2872">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2873">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2874">
                                <p className="leading-[24px]">Classic 70 Series</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.33px] size-[26px] top-[11.57px]" data-node-id="143:1056" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[10px] h-[215px] items-start relative shrink-0 w-full" data-node-id="121:2875">
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2876">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2877">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2878" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb7} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2879">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2880">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2881">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2882">
                                <p className="leading-[24px]">Classic 70 Series Vertical</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[11.57px]" data-node-id="143:1062" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2883">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2884">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2885" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb8} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2886">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2887">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2888">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2889">
                                <p className="leading-[24px]">Blue Series 12 Inch Touch</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.67px] size-[26px] top-[11.57px]" data-node-id="143:1060" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2890">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2891">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2892" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb9} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2893">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2894">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2895">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2896">
                                <p className="leading-[24px]">Blue Series 6 Inch</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.33px] size-[26px] top-[11.57px]" data-node-id="143:1058" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-node-id="143:1113">
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-node-id="137:948">
                    <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[24px] not-italic relative shrink-0 text-[18px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="137:949">
                      Wallplates
                    </p>
                  </div>
                  <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-node-id="143:1114">
                    <div className="content-stretch flex gap-[10px] h-[215px] items-start relative shrink-0 w-full" data-node-id="121:2897">
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2898">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2899">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2900" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb10} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2901">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2902">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2903">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2904">
                                <p className="leading-[24px]">80 series, 70 Series and Sensi Smart Wallplate</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[11.57px]" data-node-id="143:1064" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2906">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2907">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2908" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb11} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2909">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2910">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2911">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2912">
                                <p className="leading-[24px]">Sensi Touch Smart White Wallplate</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.67px] size-[26px] top-[11.57px]" data-node-id="143:1066" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-[1_0_0] flex-col gap-[15px] h-[215px] items-start min-w-px p-[20px] relative" data-node-id="121:2913">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2914">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2915" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb12} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2916">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2917">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2918">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2919">
                                <p className="leading-[24px]">Sensi Touch Smart Black Wallplate</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[214.33px] size-[26px] top-[11.57px]" data-node-id="143:1068" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex h-[215px] items-start relative shrink-0 w-full" data-node-id="121:2920">
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-col gap-[15px] h-[215px] items-start p-[20px] relative shrink-0 w-[253.33px]" data-node-id="121:2921">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="121:2922">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="121:2923" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb13} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="121:2924">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="121:2925">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="121:2926">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="121:2927">
                                <p className="leading-[24px]">Sensi Touch 2 and Sensi Lite Thermostat Wallplate</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[11.57px]" data-node-id="143:1070" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-node-id="143:1115">
                  <div className="content-stretch flex items-start relative shrink-0 w-full" data-node-id="137:953">
                    <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[24px] not-italic relative shrink-0 text-[18px] text-[color:var(--global-body-text-colors\/base,#2a2a26)] whitespace-nowrap" data-node-id="137:954">
                      Other
                    </p>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="144:1116">
                    <div className="content-stretch flex h-[215px] items-start relative shrink-0 w-full" data-node-id="137:931">
                      <div className="bg-[var(--programmatic-greyscale\/grey-light-40,white)] content-stretch flex flex-col gap-[15px] h-[215px] items-start p-[20px] relative shrink-0 w-[253.33px]" data-node-id="137:939">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center min-h-px relative w-full" data-node-id="137:940">
                          <div className="h-[81px] relative shadow-[0px_4px_10px_0px_rgba(0,0,0,0.15)] shrink-0 w-[125px]" data-node-id="137:941" data-name="Sensi Smart Thermostat_CB 1">
                            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSensiSmartThermostatCb14} />
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-full" data-node-id="137:942">
                          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="137:943">
                            <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-node-id="137:944">
                              <div className="[word-break:break-word] flex flex-[1_0_0] flex-col font-['Aileron:SemiBold'] justify-end leading-[0] min-w-px not-italic relative text-[16px] text-[color:var(--global-body-text-colors\/base,#2a2a26)]" data-node-id="137:945">
                                <p className="leading-[24px]">Sensi Equipment Interface Module</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute left-[215px] size-[26px] top-[11.57px]" data-node-id="143:1072" data-name="Vector">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start pt-[44px] relative shrink-0 w-[360px]" data-node-id="144:1121">
                <div className="bg-white content-stretch flex flex-col gap-[20px] isolate items-center overflow-clip py-[30px] relative shadow-[0px_8px_10px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-node-id="121:2937" data-name="Selection Panel Container">
                  <div className="content-stretch flex items-start px-[30px] relative shrink-0 w-full z-[2]" data-node-id="121:2938" data-name="Heading">
                    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col items-start leading-[0] min-w-px not-italic relative" data-node-id="121:2939">
                      <div className="flex flex-col font-['Aileron:Bold'] justify-end relative shrink-0 text-[22px] text-[color:var(--programmatic-greyscale\/grey-dark-64,black)] whitespace-nowrap" data-node-id="121:2940">
                        <p className="leading-[32px]">Selection</p>
                      </div>
                      <div className="flex flex-col font-['Aileron:Regular'] justify-end min-w-full relative shrink-0 text-[14px] text-[color:var(--programmatic-greyscale\/grey-dark-48,#2a2a26)] w-[min-content]" data-node-id="121:2941">
                        <p className="leading-[24px]">0 product families</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-center relative shrink-0 w-full z-[1]" data-node-id="121:2942" data-name="Product List">
                    <div className="content-stretch flex flex-col items-start px-[30px] relative shrink-0 w-full" data-node-id="121:2980">
                      <div className="bg-[rgba(12,48,204,0.5)] content-stretch flex gap-[4px] h-[48px] items-center justify-center relative shrink-0 w-full" data-node-id="121:2981" data-name="Button">
                        <p className="[word-break:break-word] font-['Aileron:Bold'] leading-[16px] max-w-[234px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)] tracking-[0.96px] uppercase whitespace-nowrap" data-node-id="I121:2981;585:321">
                          Continue
                        </p>
                        <div className="relative shrink-0 size-[16px]" data-node-id="I121:2981;585:322" data-name="Icon">
                          <div className="absolute inset-0" data-node-id="I121:2981;585:322;636:2615" data-name="Filled/zoom_out">
                            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFilledDdlIconGlobalArrowRight} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col h-[421px] items-start relative shrink-0 w-full z-[1]" data-node-id="121:2985" data-name="Global Footer">
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px relative w-full" data-node-id="I121:2985;998:13375">
          <div className="bg-[#101010] content-stretch flex flex-[1_0_0] flex-col items-start min-h-px px-[130px] relative w-full" data-node-id="I121:2985;998:13371">
            <div className="content-stretch flex flex-col gap-[40px] h-[251px] items-start relative shrink-0 w-full" data-node-id="I121:2985;998:13373">
              <GlobalFooterQuickLinks className="border-[var(--global-body-text-colors\/base-reversed,white)] border-b border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-h-px pb-[31px] pt-[44px] relative w-full" text="Quick Links" text1="Contact Us" text2="Investors" text3="Newsroom" text4="Careers" text5="Sign In" />
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="I121:2985;998:13372">
                <GlobalFooterSocialIcons className="content-stretch flex gap-[24px] items-start relative shrink-0 w-[1020px]" />
                <div className="content-end flex flex-wrap gap-[10px] items-end pb-[40px] pt-[30px] relative shrink-0 w-full" data-node-id="I121:2985;998:13328" data-name="Global Footer / Quick links">
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11358">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11359">
                      Sitemap
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11360">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11361">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11362">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11363">
                      Privacy Notice
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11364">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11365">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11366">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11367">
                      Terms of Use
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11368">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11369">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11370">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11371">
                      Cookies
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11372">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11373">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11374">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11375">
                      Accessibility
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11376">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11377">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11378">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11379">
                      Imprint
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11380">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11381">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11382">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11383">
                      Do Not Sell or Share My Personal Information
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11384">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11385">
                      |
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13328;992:11386">
                    <p className="[word-break:break-word] font-['Aileron:Light'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13328;992:11387">
                      Report a Vulnerability
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="I121:2985;998:13368">
            <div className="bg-black content-center flex flex-wrap gap-[457px] h-[170px] items-center px-[137px] relative shrink-0 w-full" data-node-id="I121:2985;998:13360">
              <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0" data-node-id="I121:2985;998:13360;992:12389">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13360;992:12383">
                  <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[32px] not-italic relative shrink-0 text-[22px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13360;992:12382">
                    Engineered for Sustainability
                  </p>
                </div>
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="I121:2985;998:13360;992:12384">
                  <p className="[word-break:break-word] font-['Aileron:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--global-body-text-colors\/base-reversed,white)] whitespace-nowrap" data-node-id="I121:2985;998:13360;992:12385">
                    © 2025 Copeland LP.All rights reserved
                  </p>
                </div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col h-[100px] items-start justify-center min-w-px relative" data-node-id="I121:2985;998:13360;992:12387">
                <div className="h-[100px] relative shrink-0 w-[200px]" data-node-id="I121:2985;998:13360;992:12386" data-name="copeland logo white 1">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCopelandLogoWhite1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
