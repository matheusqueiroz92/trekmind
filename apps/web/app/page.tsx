import { User } from "@trekmind/domain";

export default function Home() {
  const user = User.create({
    id: "1",
    name: "Matheus",
    email: "matheus@email.com",
  });

  return <div>{user.email}</div>;
}