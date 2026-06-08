import { ScrollView } from "react-native";


function Container({ children,  isGetter = true }: { children: React.ReactNode, isGetter?: boolean }) {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: isGetter ? 20 : 0, paddingVertical: isGetter ? 10 : 0 }}
        >
            {children}
        </ScrollView>
    );
}

export default Container;