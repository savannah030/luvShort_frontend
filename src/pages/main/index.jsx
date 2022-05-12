import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import request from "@/api/request";

import Header from "@components/header";
import VideoList from "@components/videoList";
import Navigator from "@components/navigator";
import { MainLoginModal, UploadModal } from "@components/common/modal";
import { FixedUploadBtn, FixedTopBtn } from "@components/common/button";
import ModalBackground from "@components/modalBackground";
import { changeModalFalse, changeModalTrue } from "@redux/reducers/modal";
import { MainCategory } from "@components/common/categories";
import { changeNavigator } from "@/redux/reducers/navigator";
import infiniteScroll from "@/hooks/infiniteScroll";
import userAccessCount, {
  accessAplication,
  selectUserAccess,
} from "@/redux/reducers/userAccessCount";
import Intro from "@pages/intro";

const Main = () => {
  const dispatch = useDispatch();

  const user = useSelector(({ user }) => user);
  const accessCount = useSelector(selectUserAccess);
  const [currentCategory, setCurrentCategory] = useState("전체");
  const [videoList, setVideoList] = useState([]);

  const fetchData = async () => {
    try {
      const payload = {
        category: user.interests,
        gender:
          currentCategory === "FEMALE" || currentCategory === "MALE"
            ? currentCategory
            : null,
        city: currentCategory === "우리동네" ? user.city : null,
        district: currentCategory === "우리동네" ? user.district : null,
      };

      const result = await request(
        "/api/videos/filter",
        "post",
        { lastVideoIdx: 100, userEmail: user.user.email, size: 4 },
        payload
      );

      setVideoList(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", infiniteScroll);

    return () => {
      window.removeEventListener("scroll", infiniteScroll);
    };
  }, []);

  useEffect(() => {
    dispatch(changeNavigator(""));
  }, []);

  useEffect(() => {
    const userInfo = user.user;
    if (userInfo) {
      dispatch(changeModalFalse());
    } else {
      dispatch(changeModalTrue());
    }
  }, []);

  useEffect(() => {
    if (!accessCount) {
      setTimeout(() => {
        dispatch(accessAplication());
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (user.user) {
      fetchData();
    }
  }, [currentCategory]);

  return (
    <>
      {accessCount ? (
        <>
          <Header type={"main"} />
          <Navigator />
          <FixedTopBtn />
          <FixedUploadBtn />
          <Wrapper>
            {user.user ? (
              <MainCategory
                marginTop={"23px"}
                setCurrentCategory={setCurrentCategory}
                interests={user.user.interests}
              />
            ) : (
              <></>
            )}
          </Wrapper>

          <VideoList videos={videoList} />

          {user.user ? (
            <ModalBackground children={<UploadModal />} />
          ) : (
            <ModalBackground children={<MainLoginModal />} />
          )}
        </>
      ) : (
        <Intro />
      )}
    </>
  );
};

export default Main;

const Wrapper = styled.div`
  width: 97%;
  margin: 0 auto;
`;
