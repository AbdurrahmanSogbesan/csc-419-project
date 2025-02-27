import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Post {
  title: string;
  body: string;
  id?: number;
  userId?: number;
}

export default function Home() {
  // Example of react query usage

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["getPosts"],
    queryFn: async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/posts");
      return res.data;
    },
  });

  // Example of a mutation
  const { mutateAsync: createPost } = useMutation({
    mutationKey: ["createPost"],
    mutationFn: (data: Post) =>
      axios.post("https://jsonplaceholder.typicode.com/posts", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getPosts"] }),
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Home</h3>
      {data
        ?.slice(0, 10)
        .map((post: Post) => <div key={post.id}>{post.title}</div>)}
      <button
        onClick={() =>
          createPost({
            title: "New Post",
            body: "This is a new post.",
          })
        }
        className="rounded-md bg-blue-500 p-2 text-white"
      >
        Create Post
      </button>
    </div>
  );
}
