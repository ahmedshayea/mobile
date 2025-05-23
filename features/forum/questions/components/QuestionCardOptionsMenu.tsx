import { Appearance, StyleSheet, View } from "react-native";
import { Divider, IconButton, Menu, useTheme } from "react-native-paper";
import { Question } from "@/types/forum.types";
import { useVisibleV2 } from "@/hooks/useVisible";
import ReportDialog from "@/features/reports/components/ReportDialog";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  BookmarkQuestionItem,
  RegisterQuestionItem,
  ReportQuestionMenuItem,
} from "./MoreOptionsMenuItems";
import { useRouter } from "expo-router";
import { editQuestion } from "@/lib/routing";
import { ThemedText } from "@components/ThemedText";
import * as DropDownMenu from "zeego/dropdown-menu";
import { useEffect } from "react";
import { useSettingStore } from "@features/settings/store";
import { MenuView } from "@react-native-menu/menu";
import Sheet, { useSheetRef } from "@components/Sheet";
import { useQuestion } from "@forum/hooks/useQuestions";
import ServerView from "@components/ServerView";

const MoreOptions = ({
  ownerUsername,
  questionId,
  contentTypeId,
}: {
  ownerUsername: Question["owner"]["username"];
  questionId: Question["id"];
  contentTypeId: number;
}) => {
  const theme = useTheme();
  const [visible, show, hide] = useVisibleV2(false);
  const user = useCurrentUser();
  const router = useRouter();

  const sheetRef = useSheetRef()

  const questionsQuery = useQuestion(questionId)

  // new implementation will use sheet
  return (
    <>
    <IconButton icon={"dots-vertical"} onPress={() => sheetRef.current?.expand()} />
      <Sheet snapPoints={["50%"]} ref={sheetRef}>
        <ServerView status={questionsQuery.status}>
          {questionsQuery.data?.is_bookmarked ? 
          <ThemedText>Bookmarked</ThemedText>
          :
          <ThemedText>Not Bookmarked ( bookmark ) </ThemedText>
          }
          
        </ServerView>
      </Sheet>
    </>
  )

  return (
    <Menu
      visible={visible}
      onDismiss={hide}
      anchorPosition="bottom"
      style={{ marginTop: 20 }}
      contentStyle={{
        backgroundColor: theme.colors.surface,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: theme.colors.primary,
      }}
      anchor={<IconButton icon={"dots-vertical"} onPress={show} />}
    >
      <BookmarkQuestionItem />
      <RegisterQuestionItem />
      <Divider />
      {ownerUsername === user.username ? (
        <>
          <Menu.Item
            style={styles.item}
            onPress={() => {}}
            trailingIcon={"delete"}
            title="delete"
          />
          <Menu.Item
            style={styles.item}
            onPress={() => {
              hide();
              router.push(editQuestion({ questionId: questionId }));
            }}
            trailingIcon={"circle"}
            title="edit"
          />
        </>
      ) : (
        <ReportQuestionMenuItem
          questionId={questionId}
          contentTypeId={contentTypeId}
        />
      )}
    </Menu>
  );
};

export const QUESTION_CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  item: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default MoreOptions;
