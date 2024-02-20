import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";
import React, { useEffect, useState } from "react";

interface Tasks {
  id: string;
  created_at: Date;
  user_id_that_created: string;
  title: string;
  description: string | null | undefined;
  completed: boolean;
}
[];

interface ApiResponse {
  tasks: Tasks;
}
const Home = () => {
  const { data: session } = useSession();
  const [expiredTasksViewActive, setExpiredTasksViewActive] =
    useState<boolean>(false);
  const [dataTasks, setDataTasks] = useState<Tasks[]>([]);
  const [createNewTaskInputActive, setCreateNewTaskInputActive] =
    useState<boolean>(false);

  const { data, refetch } = api.main.getTasksByUserId.useQuery();

  const [title, setTitle] = useState<string>(" ");
  const [description, setDescription] = useState<string | undefined>(null);

  useEffect(() => {
    try {
      if (data) {
        setDataTasks(data);
      }
    } catch (error) {}
  }, [data]);

  console.log(data);
  console.log(dataTasks);
  //Get Tasks By ID

  const toggleCreateNewTaskInput = () => {
    setCreateNewTaskInputActive(!createNewTaskInputActive);
  };

  const mutation = api.main.createNewTask.useMutation({});
  const handleCreateNewTask = async () => {
    try {
      await mutation.mutateAsync({ title: title, description: description });
      await refetch();
    } catch (error) {
      console.error("Error");
    }
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setTitle(e.target.value);
    } catch (error) {}
  };

  const handleChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    try {
      setDescription(e.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  if (!session) {
    return (
      <>
        <button onClick={() => signIn()}>Login With Discord</button>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-center text-3xl font-bold">TO-DO</h1>
        <div className="justify-center self-center rounded-lg bg-amber-100 p-16">
          <div>
            <h3 className="text-center text-xl">Active Tasks</h3>
            {dataTasks.length === 0 ? (
              <h3 className="text-center">
                <i>No Tasks Found</i>
              </h3>
            ) : (
              <>
                {" "}
                {dataTasks.map((task) => (
                  <>
                    <div className="flex flex-col bg-white px-7 py-3">
                      <i>Created At: {task.created_at.toDateString()}</i>
                      {task.title}
                      {task.description ? task.description : ""}
                    </div>
                  </>
                ))}
              </>
            )}
          </div>

          <div className="mt-4 text-center text-xl">
            <button className="rounded-lg p-2 text-center text-xl font-semibold hover:bg-amber-200 ">
              {!expiredTasksViewActive
                ? "View Expired Tasks"
                : "Hide Expired Tasks"}
            </button>
          </div>
          <button
            className="bottom-0 mt-7 justify-center self-center rounded-lg p-2 text-center text-xl font-semibold hover:bg-amber-200"
            onClick={toggleCreateNewTaskInput}
          >
            Create New Task
          </button>
          {createNewTaskInputActive ? (
            <>
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Title"
                  className="mb-2 rounded-md"
                  onChange={handleChangeTitle}
                />
                <textarea
                  className="mt-2 h-32 max-h-64 max-w-md resize rounded-md"
                  placeholder="Description"
                  onChange={handleChangeDescription}
                ></textarea>
                <button
                  className="mt-5 max-h-fit max-w-fit justify-center self-center rounded-lg bg-blue-500 px-5 py-3 text-center text-white"
                  onClick={handleCreateNewTask}
                >
                  Create Task
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
