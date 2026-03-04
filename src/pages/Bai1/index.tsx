import React, { useState } from "react";
import { Button, InputNumber, Typography, Card, Space, message } from "antd";

const { Title, Text } = Typography;

const GuessNumberGame: React.FC = () => {
  const [secretNumber, setSecretNumber] = useState<number>(
    () => Math.floor(Math.random() * 100) + 1
  );
  const [guess, setGuess] = useState<number | null>(null);
  const [messageText, setMessageText] = useState<string>(
    "Bạn có 10 lượt để đoán!"
  );
  const [attempts, setAttempts] = useState<number>(10);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const handleGuess = () => {
    if (gameOver) return;

    if (guess === null || guess < 1 || guess > 100) {
      message.error("Vui lòng nhập số từ 1 đến 100!");
      return;
    }

    if (guess < secretNumber) {
      setMessageText("Bạn đoán quá thấp!");
    } else if (guess > secretNumber) {
      setMessageText("Bạn đoán quá cao!");
    } else {
      setMessageText("🎉 Chúc mừng! Bạn đã đoán đúng!");
      message.success("Bạn thắng rồi!");
      setGameOver(true);
      return;
    }

    const remaining = attempts - 1;
    setAttempts(remaining);

    if (remaining === 0) {
      setMessageText(`❌ Bạn đã hết lượt! Số đúng là ${secretNumber}.`);
      message.error("Bạn đã thua!");
      setGameOver(true);
    }

    setGuess(null);
  };

  const handleRestart = () => {
    setGuess(null);
    setMessageText("Bạn có 10 lượt để đoán!");
    setAttempts(10);
    setGameOver(false);
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
  };

  return (
    <Card
      style={{
        maxWidth: 400,
        margin: "50px auto",
        textAlign: "center",
      }}
    >
      <Title level={2}>🎮 Trò Chơi Đoán Số</Title>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Text>{messageText}</Text>
        <Text strong>Lượt còn lại: {attempts}</Text>

        {!gameOver && (
          <>
            <InputNumber
              min={1}
              max={100}
              value={guess}
              onChange={(value) => setGuess(value)}
              placeholder="Nhập số từ 1-100"
              style={{ width: "100%" }}
            />

            <Button type="primary" block onClick={handleGuess}>
              Đoán
            </Button>
          </>
        )}

        {gameOver && (
          <Button type="primary" danger block onClick={handleRestart}>
            Chơi lại
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default GuessNumberGame;