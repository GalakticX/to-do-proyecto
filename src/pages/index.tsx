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

const Home = () => {
  const { data: session } = useSession();
  const [expiredTasksViewActive, setExpiredTasksViewActive] =
    useState<boolean>(false);
  const [dataTasks, setDataTasks] = useState<Tasks[]>([]);
  const [createNewTaskInputActive, setCreateNewTaskInputActive] =
    useState<boolean>(false);
  const [activeTasks, setActiveTasks] = useState<Tasks[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Tasks[]>([]);

  const { data, refetch } = api.main.getTasksByUserId.useQuery();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string | undefined>(null);

  useEffect(() => {
    try {
      if (data) {
        const active = data.filter((task) => !task.completed);
        const completed = data.filter((task) => task.completed);
        setActiveTasks(active);
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error(error);
    }
  }, [data]);

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

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-center text-3xl font-bold">TO-DO</h1>
        <div className="justify-center self-center rounded-lg bg-amber-100 p-16">
          <div>
            <h3 className="text-center text-xl">Active Tasks</h3>
            {activeTasks.length === 0 ? (
              <h3 className="text-center">
                <i>No Active Tasks Found</i>
              </h3>
            ) : (
              activeTasks.map((task) => (
                <div key={task.id} className="flex flex-col bg-white px-7 py-3">
                  <i>Created At: {task.created_at.toDateString()}</i>
                  <div className="text-lg font-semibold">{task.title}</div>
                  <div>{task.description ? task.description : ""}</div>
                  <button
                    className="max-w-fit rounded-md bg-green-500 px-2 hover:bg-green-600"
                    onClick={() => handleTaskComplete(task.id)}
                  >
                    Complete Task
                  </button>
                  <button
                    className="max-w-fit rounded-md bg-red-500 px-2 hover:bg-red-600"
                    onClick={() => handleTaskDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
          <h3 className="text-center text-xl">Completed Tasks</h3>
          {completedTasks.length === 0 ? (
            <h3 className="text-center">
              <i>No Completed Tasks Found</i>
            </h3>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="flex flex-col bg-white px-7 py-3">
                <i>Created At: {task.created_at.toDateString()}</i>
                <div className="text-lg font-semibold">{task.title}</div>
                <div>{task.description ? task.description : ""}</div>
                <button
                  className="max-w-fit rounded-md bg-blue-500 px-2 hover:bg-blue-600"
                  onClick={() => handleTaskCompleteUndo(task.id)}
                >
                  Revert Completed Task
                </button>
                <button
                  className="max-w-fit rounded-md bg-red-500 px-2 hover:bg-red-600"
                  onClick={() => handleTaskDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
          <div className="mt-4 text-center text-xl">
            <button
              className="rounded-lg p-2 text-center text-xl font-semibold hover:bg-amber-200"
              onClick={filterTasksByCompletedStatus}
            ></button>
          </div>
          <button
            className="bottom-0 mt-7 justify-center self-center rounded-lg p-2 text-center text-xl font-semibold hover:bg-amber-200"
            onClick={toggleCreateNewTaskInput}
          >
            Create New Task
          </button>
          {createNewTaskInputActive ? (
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
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
