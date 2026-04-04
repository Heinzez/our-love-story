import PremierePage from "@/components/PremierePage";

const LettersPage = () => (
  <PremierePage
    title="My Letters To You"
    emoji="💌"
    premiereDate={new Date("2025-09-05")}
    description="Words I wrote at 3am when missing you felt like a superpower."
  />
);

export default LettersPage;
