from abc import ABC, abstractmethod
from typing import Any, Dict
import openai
import asyncio
from app.core.config import settings


class BaseAgent(ABC):
    """Base class for all research agents. Uses Groq API (OpenAI-compatible)."""

    def __init__(self, name: str, model: str = None):
        self.name = name
        self.model = model or settings.GROQ_MODEL
        self.client = openai.AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url=settings.GROQ_BASE_URL,
        )

    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the agent's primary task."""
        pass

    async def _call_llm(self, system_prompt: str, user_prompt: str, **kwargs) -> str:
        """Call the LLM with given prompts. Auto-retry on rate limit."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=kwargs.get("temperature", 0.3),
                    max_tokens=kwargs.get("max_tokens", 4096),
                )
                return response.choices[0].message.content
            except openai.RateLimitError as e:
                wait_time = (attempt + 1) * 5  # 5s, 10s, 15s
                print(f"[{self.name}] Rate limited, waiting {wait_time}s (attempt {attempt+1}/{max_retries})")
                await asyncio.sleep(wait_time)
                if attempt == max_retries - 1:
                    raise
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2)

    def __repr__(self):
        return f"<{self.__class__.__name__}(name={self.name})>"
