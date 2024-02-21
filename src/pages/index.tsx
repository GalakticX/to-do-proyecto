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

interface CombinedTask {
  id: string;
  shared_at: Date;
  original_user_that_created_task: string;
  shared_with_user_id: string;
  task_id: string;
  title: string;
  description?: string;
  completed: boolean;
}

const Home = () => {
  const { data: session } = useSession();
  const [expiredTasksViewActive, setExpiredTasksViewActive] =
    useState<boolean>(false);
  const [dataTasks, setDataTasks] = useState<Tasks[]>([]);

  const [dataSharedTasks, setDataSharedTasks] = useState<SharedTasks[]>([]);
  const [createNewTaskInputActive, setCreateNewTaskInputActive] =
    useState<boolean>(false);
  const [activeTasks, setActiveTasks] = useState<Tasks[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Tasks[]>([]);
  const [sharedTasks, setSharedTasks] = useState<CombinedTask[]>([]);

  const { data, refetch } = api.main.getTasksByUserId.useQuery();
  const { data: dataGetSharedTasks, refetch: refetchGetSharedTasks } =
    api.main.getSharedTasksForUserId.useQuery();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string | undefined>(null);

  useEffect(() => {
    try {
      if (data) {
        const active = data.filter((task) => !task.completed);
        const completed = data.filter((task) => task.completed);
        console.log("The shared task is", dataGetSharedTasks);
        setActiveTasks(active);
        setCompletedTasks(completed);
        setSharedTasks(dataGetSharedTasks);
      }
    } catch (error) {
      console.error(error);
    }
  }, [data, dataGetSharedTasks]);

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

  const mutationDeleteTask = api.main.deleteTaskById.useMutation();
  const handleTaskDelete = async (id: string) => {
    try {
      console.log("Deleting ");
      await mutationDeleteTask.mutateAsync({ id });
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const mutationCompleteTask = api.main.completeTaskById.useMutation();
  const handleTaskComplete = async (id: string) => {
    try {
      await mutationCompleteTask.mutateAsync({ id });
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const mutationUndoCompletedTask = api.main.uncompleteTaskById.useMutation();
  const handleTaskCompleteUndo = async (id: string) => {
    try {
      console.log("Test");
      await mutationUndoCompletedTask.mutateAsync({ id });
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const filterTasksByCompletedStatus = () => {
    setExpiredTasksViewActive(!expiredTasksViewActive);
  };
  const shareMutation = api.main.shareTaskToUserById.useMutation();
  const [shareToUserId, setShareToUserId] = useState<string | undefined>();
  const handleUserIDCHange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setShareToUserId(e.target.value);
    } catch (error) {
      console.error(error);
    }
  };
  const handleShare = async (task_id: string) => {
    try {
      await shareMutation.mutateAsync({
        task_id: task_id,
        user_id: shareToUserId,
      });
    } catch (error) {
      console.error("Internal Server Error");
    }
  };

  if (!session?.user) {
    return (
      <>
        <div className="flex flex-col content-center justify-center self-center">
          <div className="size-56 content-center justify-center self-center rounded-lg bg-gray-200 p-10">
            <button
              className="rounded-md  bg-blue-500 p-5 text-center text-white"
              onClick={() => signIn()}
            >
              Login Using Discord
            </button>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex h-screen flex-col bg-gray-400">
        <div className="flex items-center justify-between bg-gray-100 p-4">
          <h1 className="text-3xl font-bold">To-Do List</h1>
          <div>
            <button
              className="mr-4 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg"
              onClick={() => signOut()}
            >
              Logout
            </button>
            <button
              className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg"
              onClick={() => signIn()}
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="flex flex-grow bg-gray-100">
          <div className="w-1/3 bg-gray-100 p-4">
            <h3 className="mb-4 text-xl font-bold">Active Tasks</h3>
            {activeTasks.length === 0 ? (
              <p className="text-center italic">No Active Tasks Found</p>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="mb-4 rounded-lg bg-white p-4">
                  <p className="italic">
                    Created At: {task.created_at.toDateString()}
                  </p>
                  <h4 className="text-lg font-semibold">{task.title}</h4>
                  <p>{task.description ?? ""}</p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      Complete Task
                    </button>
                    <button
                      className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      onClick={() => handleTaskDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-4">Share With</div>
                  <input
                    type="text"
                    placeholder="Account ID"
                    onChange={handleUserIDCHange}
                    className="rounded-md border border-gray-300 p-1"
                  />
                  <button
                    className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    onClick={() => handleShare(task.id)}
                  >
                    Share
                  </button>
                </div>
              ))
            )}
            <button
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={toggleCreateNewTaskInput}
            >
              Create New Task
            </button>
            {createNewTaskInputActive && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="mb-2 rounded-md border border-gray-300 p-2"
                  onChange={handleChangeTitle}
                />
                <textarea
                  className="mt-2 h-32 max-h-64 resize-none rounded-md border border-gray-300 p-2"
                  placeholder="Description"
                  onChange={handleChangeDescription}
                />
                <button
                  className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  onClick={handleCreateNewTask}
                >
                  Create Task
                </button>
              </div>
            )}
          </div>

          <div className="w-1/3 bg-gray-100 p-4">
            <h3 className="mb-4 text-xl font-bold">Completed Tasks</h3>
            {completedTasks.length === 0 ? (
              <p className="text-center italic">No Completed Tasks Found</p>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="mb-4 rounded-lg bg-white p-4">
                  <p className="italic">
                    Created At: {task.created_at.toDateString()}
                  </p>
                  <h4 className="text-lg font-semibold">{task.title}</h4>
                  <p>{task.description || ""}</p>
                  <button
                    className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    onClick={() => handleTaskCompleteUndo(task.id)}
                  >
                    Revert Completed Task
                  </button>
                  <button
                    className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    onClick={() => handleTaskDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="w-1/3 bg-gray-100 p-4">
            <h3 className="mb-4 text-xl font-bold">Shared Tasks</h3>
            {sharedTasks.map((task) => (
              <div key={task.id} className="mb-4 rounded-lg bg-white p-4">
                <p>
                  Task Shared By User: {task.original_user_that_created_task}
                </p>
                <p>Task Title: {task.title}</p>
                <p>Description: {task.description}</p>
                <p>Completed status: {task.completed}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
