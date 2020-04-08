#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char *ssid = "Dom";
const char *pass = "Monikasu123456";
#define greenLed 16 // D0
#define RST_PIN 5   // D1
#define SS_PIN 4    // D2
#define redLed 0    // D3

WiFiClient client;
MFRC522 mfrc522(SS_PIN, RST_PIN);

void blink(int count, int timeout, int diode)
{
  for (int i = 0; i < count; i++)
  {
    digitalWrite(diode, HIGH);
    delay(timeout);
    digitalWrite(diode, LOW);
    if (count > 1)
    {
      delay(timeout);
    }
  }
}

String getUID_tag()
{
  String UID_tag = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    UID_tag.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
    UID_tag.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  UID_tag.toUpperCase();
  UID_tag = UID_tag.substring(1);

  return UID_tag;
}

void connectToWiFi()
{
  Serial.println("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    blink(1, 250, greenLed);
    delay(250);
  }

  Serial.println();
  Serial.println("WiFi connected");
  blink(1, 2000, greenLed);
}

void postUID(const String UID_tag)
{
  Serial.println("Sending UID tag");
  HTTPClient http;

  http.begin("http://192.168.1.102:3000/api/uid");
  http.addHeader("Content-Type", "text/plain");

  int httpCode = http.POST(UID_tag);
  String payload = http.getString();
  Serial.println("UID tag sent, response: ");
  Serial.println(httpCode);
  if (httpCode == 302)
  {
    Serial.println("Teacher");
    blink(1, 1000, greenLed);
  }
  else if (httpCode == 202)
  {
    Serial.println("Student");
    blink(1, 1000, greenLed);
  }
  else
  {
    Serial.println("Wrong UID tag");
    blink(3, 500, redLed);
  }

  http.end();
  delay(750);
}

void setup()
{
  Serial.begin(9600);
  SPI.begin();
  pinMode(greenLed, OUTPUT);
  pinMode(redLed, OUTPUT);
  mfrc522.PCD_Init();
  Serial.println();
  connectToWiFi();
}

void loop()
{
  //Check WiFi connection status
  if (WiFi.status() == WL_CONNECTED)
  {
    if (!mfrc522.PICC_IsNewCardPresent())
    {
      return;
    }
    if (!mfrc522.PICC_ReadCardSerial())
    {
      return;
    }

    String UID_tag = getUID_tag();

    Serial.println();
    Serial.print(" UID tag : ");
    Serial.println(UID_tag);
    Serial.println();

    // Test
    if (UID_tag == "C1 B0 1D 2B")
    {
      Serial.println(" + ");
    }
    else
    {
      Serial.println(" - ");
    }

    postUID(UID_tag);
  }
  else
  {
    Serial.println("No WiFi");
  }
  delay(500);
}
