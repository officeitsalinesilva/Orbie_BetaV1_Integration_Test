import asyncio
import httpx
import json

async def main():
    base = "http://localhost:8000"

    async with httpx.AsyncClient() as client:

        print("\n--- 1. NOW SUBJECT ---")
        r = await client.post(f"{base}/api/v5/now/subject", json={})

        print("STATUS:", r.status_code)
        print("BODY:")
        print(r.text)

        if r.status_code != 200:
            return

        now_data = r.json()
        subject = now_data.get("subject")

        print("\n--- 2. RAW SUBJECT ---")
        print(json.dumps(subject, indent=2, ensure_ascii=False))

        allowed_fields = {
            "name",
            "year",
            "month",
            "day",
            "hour",
            "minute",
            "second",
            "city",
            "nation",
            "longitude",
            "latitude",
            "timezone",
            "altitude",
            "geonames_username",
        }

        normalized = {
            key: value
            for key, value in subject.items()
            if key in allowed_fields
        }

        if not normalized.get("name"):
            normalized["name"] = "Transit"

        print("\n--- 3. NORMALIZED SUBJECT ---")
        print(json.dumps(normalized, indent=2, ensure_ascii=False))

        payload = {
            "first_subject": {
                "name": "Test User",
                "year": 1999,
                "month": 3,
                "day": 14,
                "hour": 0,
                "minute": 45,
                "second": 0,
                "city": "Belo Horizonte",
                "nation": "BR",
                "longitude": -43.9386,
                "latitude": -19.9167,
                "timezone": "America/Sao_Paulo"
            },
            "transit_subject": normalized
        }

        print("\n--- 4. TRANSIT PAYLOAD ---")
        print(json.dumps(payload, indent=2, ensure_ascii=False))

        r = await client.post(
            f"{base}/api/v5/context/transit",
            json=payload
        )

        print("\n--- 5. TRANSIT RESPONSE ---")
        print("STATUS:", r.status_code)
        print("BODY:")
        print(r.text)

asyncio.run(main())
