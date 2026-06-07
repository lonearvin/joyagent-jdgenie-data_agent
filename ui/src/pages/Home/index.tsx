import { useState, useCallback, memo } from "react";
import GeneralInput from "@/components/GeneralInput";
import Slogn from "@/components/Slogn";
import ChatView from "@/components/ChatView";
import DataListDrawer from "@/components/DataListDrawer";
import ColsAndDataDrawer from "@/components/DataListDrawer/ColsAndDataDrawer";

import { productList, defaultProduct, chatQustions } from "@/utils/constants";
import classNames from "classnames";

type HomeProps = Record<string, never>;

const Home: GenieType.FC<HomeProps> = memo(() => {
  const [inputInfo, setInputInfo] = useState<CHAT.TInputInfo>({
    message: "",
    deepThink: false,
  });
  const [product, setProduct] = useState(defaultProduct);
  const [dbsShow, setDbsShow] = useState(false);
  const [dataShow, setDataShow] = useState(false);
  const [curModel, setCurModel] = useState<CHAT.ModelInfo>({
    modelName: "",
    modelCode: "",
    schemaList: [],
  });

  const changeInputInfo = useCallback((info: CHAT.TInputInfo) => {
    setInputInfo(info);
  }, []);

  const toSendMessage = useCallback((query: Record<string, any>) => {
    setInputInfo({
      message: query.label,
      outputStyle: "dataAgent",
      deepThink: query.type === 2,
    });
  }, []);

  const showDetail = useCallback((modelInfo: any) => {
    setCurModel(modelInfo);
    setDataShow(true);
  }, []);

  const renderContent = () => {
    if (inputInfo.message.length === 0) {
      return (
        <div className="pt-[120px] flex flex-col items-center">
          <Slogn />
          <div className="w-640 rounded-xl shadow-[0_18px_39px_0_rgba(198,202,240,0.1)]">
            <GeneralInput placeholder={product.placeholder} showBtn={true} size="big" disabled={false} product={product} send={changeInputInfo} dbsShow={setDbsShow} />
          </div>
          <div className="w-640 flex flex-wrap gap-16 mt-[16px]">
            {productList.map((item, i) => (
              <div
                key={i}
                className={`w-[18%] h-[36px] cursor-pointer flex items-center justify-center border rounded-[8px] ${item.type === product.type ? "border-[#4040ff] bg-[rgba(64,64,255,0.02)] text-[#4040ff]" : "border-[#E9E9F0] text-[#666]"}`}
                onClick={() => setProduct(item)}
              >
                <i className={`font_family ${item.img} ${item.color}`}></i>
                <div className="ml-[6px]">{item.name}</div>
              </div>
            ))}
          </div>
          <div className="mt-80 mb-120 relative">
            {/* 漂浮的建议问题 */}
            <div
              className={classNames("absolute top-[-45px] p-0 w-full overflow-hidden transition-all duration-400 opacity-0", { "opacity-100 top-[-65px]": product.type === "dataAgent" })}
            >
              <div className="flex gap-x-[12px] justify-center ">
                {chatQustions.map((item, i) => (
                  <div
                    key={i}
                    className="text-[#52525B] cursor-pointer border border-[#E9E9F0] rounded-[8px] px-[16px] py-[4px] text-[14px] whitespace-nowrap flex items-center gap-[3px]"
                    onClick={() => toSendMessage(item)}
                  >
                    {item.type === 2 && <i className="font_family icon-shendusikao"></i>}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

          </div>
          {/* 模型列表 */}
          <DataListDrawer show={dbsShow} dbsShow={setDbsShow} showDetail={showDetail}></DataListDrawer>
          {/* 列字段和数据 */}
          {dataShow && <ColsAndDataDrawer show={dataShow} dataShow={setDataShow} modelInfo={curModel}></ColsAndDataDrawer>}
        </div>
      );
    }
    return <ChatView inputInfo={inputInfo} product={product} />;
  };

  return <div className="h-full flex flex-col items-center ">{renderContent()}</div>;
});

Home.displayName = "Home";

export default Home;
