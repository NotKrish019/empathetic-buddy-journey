
import React, { useState, useEffect } from "react";
import PersonalizedQuestionnaire from "./PersonalizedQuestionnaire";
import PersonalizedCourse from "./PersonalizedCourse";
import { supabase } from "@/lib/supabase";

const PersonalizedCourseSection = () => {
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_questionnaire")
          .select("id")
          .single();

        if (data) {
          setHasCompletedQuestionnaire(true);
        }
      } catch (error) {
        console.error("Error checking questionnaire status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkQuestionnaireStatus();
  }, []);

  const handleQuestionnaireComplete = () => {
    setHasCompletedQuestionnaire(true);
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-chat-light">Loading...</div>;
  }

  return (
    <>
      {hasCompletedQuestionnaire ? (
        <PersonalizedCourse />
      ) : (
        <PersonalizedQuestionnaire onComplete={handleQuestionnaireComplete} />
      )}
    </>
  );
};

export default PersonalizedCourseSection;
