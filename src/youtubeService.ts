import axios from "axios";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";

interface ChannelStatistics {
  subscriberCount: number;
  videoCount: number;
}

interface ChannelDetails {
  id: string;
  title: string;
  description: string;
  statistics: ChannelStatistics;
  channelId: string;
  subscriberCount: string;
  videoCount: string;
  category: string;
}

export class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 특정 카테고리의 채널 검색
   * @param category 카테고리 키워드 (예: 게임, 음악)
   * @param maxResults 최대 결과 수
   */
  public async searchChannelsByCategory(
    category: string,
    maxResults: number = 10
  ): Promise<ChannelDetails[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          part: "snippet",
          q: category,
          type: "channel",
          maxResults,
          regionCode: "KR", // 한국 유튜버로 제한
          relevanceLanguage: "ko", // 한국어로 제한
          key: this.apiKey,
        },
      });

      const channelIds = response.data.items.map(
        (item: any) => item.id.channelId
      );
      return this.getChannelDetails(category, channelIds);
    } catch (error) {
      console.error("채널 검색 중 오류 발생:", error);
      throw error;
    }
  }

  /**
   * 채널 ID로 채널 세부 정보 가져오기
   * @param channelIds 채널 ID 배열
   */
  private async getChannelDetails(
    category: string,
    channelIds: string[]
  ): Promise<ChannelDetails[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/channels`, {
        params: {
          part: "snippet,statistics",
          id: channelIds.join(","),
          key: this.apiKey,
        },
      });

      return response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        statistics: {
          subscriberCount: parseInt(item.statistics.subscriberCount, 10),
          videoCount: parseInt(item.statistics.videoCount, 10),
        },
        channelId: item.id,
        subscriberCount: parseInt(item.statistics.subscriberCount, 10),
        videoCount: parseInt(item.statistics.videoCount, 10),
        category,
      }));
    } catch (error) {
      console.error("채널 세부 정보 가져오기 중 오류 발생:", error);
      throw error;
    }
  }
}
