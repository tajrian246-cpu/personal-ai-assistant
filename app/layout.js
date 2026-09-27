export const metadata = {
  title: "Personal AI Assistant",
  description: "Personal study and business assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
