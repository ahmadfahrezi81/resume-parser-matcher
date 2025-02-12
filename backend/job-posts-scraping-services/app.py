import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig


async def main():
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url="https://www.linkedin.com/jobs/search/?currentJobId=4136989159",
        )
        print(result.markdown[:10000])


if __name__ == "__main__":
    asyncio.run(main())
