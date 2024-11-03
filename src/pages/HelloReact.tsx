import React, {useState} from "react";
import { Button } from "@/components/ui/button";

const HelloReact = () => {
    const [count, setCount] = useState(0);

  const handleClick = () => setCount(count + 1);
  return (
    <div className="flex flex-col items-center justify-center fixed inset-0 min-h-screen bg-blue-100">
      <h1 className="text-4xl font-bold mb-6">Hello, React with ShadCN!</h1>
      <Button variant="default" onClick={handleClick}>Clicked {count} times</Button>
    </div>
  );
};

export default HelloReact;
