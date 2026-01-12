import Link from "next/link";
import { Button, Result } from "antd";
import { HomeOutlined } from "@ant-design/icons";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-church-primary/5 to-church-accent/5 p-4">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link href="/">
            <Button type="primary" size="large" icon={<HomeOutlined />}>
              Back Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}
