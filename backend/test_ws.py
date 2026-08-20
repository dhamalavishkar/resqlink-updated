import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/api/v1/mesh/ws/signaling/test-peer"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            # Wait for a message (peer list)
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"Received: {message}")
            data = json.loads(message)
            print(f"Parsed: {data}")
            # Send a test message
            test_msg = {
                "type": "test",
                "target": "test-peer",
                "content": "hello"
            }
            await websocket.send(json.dumps(test_msg))
            print("Sent test message")
            # Wait for a response (if any)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"Received response: {response}")
            except asyncio.TimeoutError:
                print("No response received (timeout)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
