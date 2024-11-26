import dotenv from "dotenv";
import schedule from "node-schedule";
import { YouTubeService } from "./youtubeService.js";
import { query } from "./db.js";

// 환경 변수 로드
dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  throw new Error(
    "YouTube API 키가 설정되지 않았습니다. .env 파일을 확인하세요."
  );
}

const youtubeService = new YouTubeService(API_KEY);
const categories = ["먹방", "음식", "여향", "게임", "음악", "뷰티"]; // 검색할 카테고리 목록
const fetchAndStoreData = async () => {
  for (const category of categories) {
    console.log(`카테고리 "${category}"에 대한 데이터를 수집합니다.`);

    try {
      const channels = await youtubeService.searchChannelsByCategory(
        category,
        10
      );

      for (const channel of channels) {
        try {
          // console.log(
          //   channel.channelId,
          //   channel.title,
          //   channel.description,
          //   channel.subscriberCount,
          //   channel.videoCount,
          //   channel.category
          // );
          await query(
            `INSERT INTO influencers (channel_id, title, description, subscriber_count, video_count, category)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (channel_id) DO NOTHING`,
            [
              channel.channelId,
              channel.title,
              channel.description,
              channel.subscriberCount,
              channel.videoCount,
              channel.category,
            ]
          );
          console.log(`채널 "${channel.title}" 데이터 저장 성공.`);
        } catch (error) {
          console.error(`채널 "${channel.title}" 데이터 저장 실패:`, error);
        }
      }
    } catch (error) {
      console.error(`카테고리 "${category}" 데이터 수집 실패:`, error);
    }
  }
};
fetchAndStoreData();
// 매일 0시에 실행
// schedule.scheduleJob("*/1 * * * *", () => {
//   console.log("배치 작업 시작...");
// });

/**
 * 카테고리별로 한국 유튜버 정보를 출력
 */
const youtubeAPITest = async () => {
  try {
    const maxResults = 10; // 각 카테고리당 최대 검색 결과 수

    for (const category of categories) {
      console.log(`카테고리: ${category}`);
      const channels = await youtubeService.searchChannelsByCategory(
        category,
        maxResults
      );

      channels.forEach((channel) => {
        console.log(`- 채널명: ${channel.title}`);
        console.log(`  구독자 수: ${channel.statistics.subscriberCount}`);
        console.log(`  동영상 수: ${channel.statistics.videoCount}`);
        console.log(`  설명: ${channel.description}`);
        console.log();
      });
    }
  } catch (error) {
    console.error("오류 발생:", error);
  }
};
